// Elementos de la interfaz fuera del canvas: bitácora, carteles, HUD, reporte, botones, listas

import { ALGORITMOS, CON_COSTO, NOMBRES } from "./constantes.js";
import { $, relleno } from "./util.js";
import { estado } from "./estado.js";
import { api } from "./api.js";
import { sprite, iconoSprite } from "./sprites.js";

// ---------------------------------------------------------------- Bitácora y carteles

export function registrar(texto, clase = "") {
  const li = document.createElement("li");
  li.textContent = texto;
  if (clase) li.className = clase;
  $("bitacora").prepend(li);
}

export function limpiarBitacora() {
  $("bitacora").replaceChildren();
}

export function mostrarCartel(titulo, texto, derrota = false, victoria = false) {
  const cartel = $("cartel");
  cartel.querySelector(".cartel-titulo").textContent = titulo;
  cartel.querySelector(".cartel-texto").textContent = texto;
  cartel.classList.toggle("derrota", derrota);
  cartel.classList.toggle("victoria", victoria);
  cartel.hidden = false;
}

export function ocultarCartel() {
  $("cartel").hidden = true;
}

// ---------------------------------------------------------------- HUD, reporte y botones

export function actualizarHud() {
  const paso = estado.camino[estado.indice];
  const total = estado.mundo?.plantas_cantidad ?? 0;
  $("hud-espadas").textContent = paso ? paso.fertilizante : 0;
  $("hud-combustible").textContent = relleno(paso ? paso.combustible : 0, 2);
  $("hud-bowsers").textContent = `${paso ? paso.plantas_regadas.length : 0}/${total}`;
  const ultimo = Math.max(estado.camino.length - 1, 0);
  $("hud-paso").textContent = `${relleno(estado.indice, 3)}/${relleno(ultimo, 3)}`;
}

export function algoritmoSeleccionado() {
  return document.querySelector("input[name=algoritmo]:checked")?.value ?? null;
}

export function actualizarBotones() {
  const hayRecorrido = estado.camino.length > 1;
  const bloqueado = estado.ocupado || !api.disponible();
  $("btn-archivo").disabled = bloqueado;
  $("btn-ejemplo").disabled = bloqueado;
  $("btn-jugar").disabled = bloqueado || !estado.mundo || !algoritmoSeleccionado();
  $("btn-pausa").disabled = !hayRecorrido || estado.terminado;
  $("btn-paso").disabled = !hayRecorrido || estado.terminado || estado.reproduciendo;
  $("btn-reiniciar").disabled = !hayRecorrido;
  $("btn-pausa").textContent = estado.reproduciendo ? "❚❚ PAUSA" : "▶ SEGUIR";
}

function formatearTiempo(seg) {
  return seg < 1 ? `${(seg * 1000).toFixed(2)} ms` : `${seg.toFixed(3)} s`;
}

function formatearCosto(c) {
  return Number.isInteger(c) ? String(c) : c.toFixed(1);
}

export function mostrarReporte(algoritmo, stats) {
  $("r-algoritmo").textContent = NOMBRES[algoritmo] ?? algoritmo;
  $("r-nodos").textContent = stats.nodos_expandidos.toLocaleString("es-CO");
  $("r-profundidad").textContent = stats.profundidad;
  $("r-tiempo").textContent = formatearTiempo(stats.tiempo_seg);
  $("r-fila-costo").hidden = !CON_COSTO.has(algoritmo);
  $("r-costo").textContent = stats.costo >= 0 ? formatearCosto(stats.costo) : "—";

  const reporte = $("reporte");
  reporte.classList.remove("nuevo");
  void reporte.offsetWidth; // reinicia la animación CSS
  reporte.classList.add("nuevo");
}

export function limpiarReporte() {
  for (const id of ["r-algoritmo", "r-nodos", "r-profundidad", "r-tiempo", "r-costo"]) $(id).textContent = "—";
  $("r-fila-costo").hidden = true;
}

// ---------------------------------------------------------------- Listas estáticas

export function pintarAlgoritmos() {
  const tipo = document.querySelector("input[name=tipo]:checked").value;
  const lista = $("lista-algoritmos");
  lista.replaceChildren();
  let primero = true;
  for (const { id, nombre } of ALGORITMOS[tipo]) {
    const disponible = !estado.disponibles || estado.disponibles.has(id);
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "algoritmo";
    input.value = id;
    input.disabled = !disponible;
    if (disponible && primero) {
      input.checked = true;
      primero = false;
    }
    const span = document.createElement("span");
    span.textContent = disponible ? nombre : `${nombre} (no disponible)`;
    label.append(input, span);
    lista.append(label);
  }
  actualizarBotones();
}

export function pintarLeyenda() {
  const aplastado = document.createElement("canvas");
  aplastado.width = aplastado.height = 32;
  aplastado.className = "icono-sprite";
  const c = aplastado.getContext("2d");
  c.imageSmoothingEnabled = false;
  c.drawImage(sprite("bowser", "bowserDerrotado"), 0, 16, 32, 16);

  const elementos = [
    [iconoSprite("marioA", "mario"), "Mario", "AgroBot"],
    [iconoSprite("ladrillo", "ladrillo"), "Ladrillo", "Muro"],
    [iconoSprite("bowser", "bowser"), "Bowser", "Cultivo seco"],
    [aplastado, "Bowser K.O.", "Cultivo tratado"],
    [iconoSprite("espada", "espada"), "Espada", "Fertilizante"],
    [iconoSprite("champinon", "champinon"), "Champiñón", "Avioneta"],
  ];
  const ul = $("leyenda");
  for (const [icono, nombre, original] of elementos) {
    const li = document.createElement("li");
    const texto = document.createElement("span");
    texto.textContent = nombre;
    const sub = document.createElement("small");
    sub.textContent = original;
    texto.append(sub);
    li.append(icono, texto);
    ul.append(li);
  }

  $("hud-icono-espada").append(iconoSprite("espada", "espada", 2));
  $("hud-icono-champinon").append(iconoSprite("champinon", "champinon", 2));
  $("hud-icono-bowser").append(iconoSprite("bowser", "bowser", 2));
}
