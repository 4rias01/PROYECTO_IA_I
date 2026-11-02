// Reproducción del camino: avanza los pasos, dispara eventos (sonido, bitácora, textos) y dibuja cada cuadro

import { $, clave, coordenada } from "./util.js";
import { estado } from "./estado.js";
import { Sonido } from "./sonido.js";
import { dibujar, textoFlotante } from "./render.js";
import { registrar, limpiarBitacora, mostrarCartel, ocultarCartel, actualizarHud, actualizarBotones } from "./ui.js";

function msPorPaso() {
  const v = Number($("velocidad").value);
  return 700 * Math.pow(0.75, v - 1);
}

function llegarA(i) {
  const previo = estado.camino[i - 1];
  const paso = estado.camino[i];
  estado.indice = i;
  estado.visitadas.add(clave(previo.pos));

  const total = estado.mundo.plantas_cantidad;
  switch (paso.evento) {
    case "recarga_fertilizante":
      Sonido.espada();
      textoFlotante(`+${paso.fertilizante} ESPADAS`, paso.pos, "#bcd8fc");
      registrar(`Mario toma ${paso.fertilizante} espadas en ${coordenada(paso.pos)}`, "ev-espada");
      break;
    case "avion":
      Sonido.champinon();
      textoFlotante("POWER UP!", paso.pos, "#fcd800");
      registrar(`¡Champiñón! ${paso.combustible} movimientos a costo ½`, "ev-champinon");
      break;
    case "riego": {
      Sonido.bowser();
      textoFlotante("K.O.!", paso.pos, "#7cfc7c");
      const quedan = total - paso.plantas_regadas.length;
      registrar(`Bowser derrotado en ${coordenada(paso.pos)} · quedan ${quedan}`, "ev-bowser");
      break;
    }
  }
  if (previo.combustible > 0 && paso.combustible === 0) {
    Sonido.sinCombustible();
    registrar("Se acabó el champiñón: costo normal otra vez", "ev-champinon");
  }
  actualizarHud();
}

function avanzar(dt) {
  const ultimo = estado.camino.length - 1;
  estado.progreso += dt / msPorPaso();
  while (estado.progreso >= 1 && estado.indice < ultimo) {
    estado.progreso -= 1;
    llegarA(estado.indice + 1);
  }
  if (estado.indice >= ultimo) terminar();
}

function terminar() {
  estado.progreso = 0;
  estado.reproduciendo = false;
  if (estado.terminado) return;
  estado.terminado = true;
  estado.visitadas.add(clave(estado.camino[estado.indice].pos));
  const pasos = estado.camino.length - 1;
  Sonido.victoria();
  registrar(`¡Todos los Bowsers derrotados en ${pasos} pasos!`, "ev-meta");
  mostrarCartel("¡VICTORIA!", "Clic para ver el mundo final", false, true);
  actualizarBotones();
}

// Vuelve al paso 0 del camino actual; con `reproducir` empieza a animar de inmediato
export function reiniciarAnimacion(reproducir) {
  estado.indice = 0;
  estado.progreso = 0;
  estado.terminado = false;
  estado.mirando = 1;
  estado.visitadas = new Set();
  estado.textos = [];
  estado.indiceChampinon = estado.camino.findIndex((p) => p.evento === "avion");
  if (estado.indiceChampinon === -1) estado.indiceChampinon = Infinity;
  estado.reproduciendo = reproducir && estado.camino.length > 1;
  if (reproducir && estado.camino.length === 1) terminar();
  actualizarHud();
  actualizarBotones();
}

// Controles manuales

export function alternarPausa() {
  estado.reproduciendo = !estado.reproduciendo;
  actualizarBotones();
}

export function pasoManual() {
  if (estado.indice < estado.camino.length - 1) {
    estado.progreso = 0;
    llegarA(estado.indice + 1);
    if (estado.indice === estado.camino.length - 1) terminar();
  }
}

export function repetir() {
  ocultarCartel();
  limpiarBitacora();
  registrar("Repetición");
  reiniciarAnimacion(true);
}

// Bucle de dibujo (requestAnimationFrame)

let ultimoT = performance.now();
function bucle(t) {
  const dt = Math.min(t - ultimoT, 100);
  ultimoT = t;
  if (estado.reproduciendo) avanzar(dt);
  dibujar(t);
  requestAnimationFrame(bucle);
}

export function iniciarBucle() {
  // Espera a que cargue la tipografía para que el canvas no pinte con la fuente de respaldo
  document.fonts.ready.then(() => requestAnimationFrame(bucle));
}
