// Interfaz de AgroBot con estética 8-bit:
// Mario = AgroBot, Bowser = cultivo seco, espada = fertilizante, champiñón = avioneta

const TAM = 10;          // celdas por lado
const CELDA = 64;        // px de canvas por celda (sprite de 16px ampliado x4)
const PIXEL = CELDA / 16;
const PARED = "1";
const RUTA_EJEMPLO = "modelo/tableros/lab.txt";

const ALGORITMOS = {
  no_informada: [
    { id: "bfs", nombre: "Amplitud" },
    { id: "costo", nombre: "Costo uniforme" },
    { id: "dfs", nombre: "Profundidad evitando ciclos" },
  ],
  informada: [
    { id: "greedy", nombre: "Avara" },
    { id: "astar", nombre: "A*" },
  ],
};
const NOMBRES = Object.fromEntries(Object.values(ALGORITMOS).flat().map((a) => [a.id, a.nombre]));
// Solo estos algoritmos muestran el costo en el reporte (según el enunciado)
const CON_COSTO = new Set(["costo", "astar"]);

const $ = (id) => document.getElementById(id);
const lienzo = $("tablero");
const ctx = lienzo.getContext("2d");

const estado = {
  api: null,
  disponibles: null,   // algoritmos que expone el backend
  mundo: null,
  camino: [],
  indice: 0,           // último paso alcanzado
  progreso: 0,         // 0..1 del trayecto hacia el siguiente paso
  reproduciendo: false,
  terminado: false,
  ocupado: false,
  mirando: 1,          // 1 derecha, -1 izquierda
  visitadas: new Set(),
  indiceChampinon: Infinity,
  textos: [],
};

const clave = ([x, y]) => `${x},${y}`;
const coordenada = ([x, y]) => `(${y},${x})`;
const relleno = (n, ancho) => String(n).padStart(ancho, "0");

// ---------------------------------------------------------------- Bitácora y carteles

function registrar(texto, clase = "") {
  const li = document.createElement("li");
  li.textContent = texto;
  if (clase) li.className = clase;
  $("bitacora").prepend(li);
}

function mostrarCartel(titulo, texto, derrota = false, victoria = false) {
  const cartel = $("cartel");
  cartel.querySelector(".cartel-titulo").textContent = titulo;
  cartel.querySelector(".cartel-texto").textContent = texto;
  cartel.classList.toggle("derrota", derrota);
  cartel.classList.toggle("victoria", victoria);
  cartel.hidden = false;
}

function ocultarCartel() {
  $("cartel").hidden = true;
}

function textoFlotante(texto, [x, y], color) {
  estado.textos.push({ texto, x, y, color, t0: performance.now() });
}

// ---------------------------------------------------------------- Dibujo

function dibujarSprite(img, x, y, ancho = CELDA, alto = CELDA, espejo = false) {
  if (espejo) {
    ctx.save();
    ctx.translate(x + ancho, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, ancho, alto);
    ctx.restore();
  } else {
    ctx.drawImage(img, x, y, ancho, alto);
  }
}

function dibujarFondo() {
  const matriz = estado.mundo?.matriz;
  for (let y = 0; y < TAM; y++) {
    for (let x = 0; x < TAM; x++) {
      if (matriz && matriz[y][x] === PARED) {
        dibujarSprite(sprite("ladrillo"), x * CELDA, y * CELDA);
      } else {
        ctx.fillStyle = (x + y) % 2 ? "#5c94fc" : "#6ca0fc";
        ctx.fillRect(x * CELDA, y * CELDA, CELDA, CELDA);
      }
    }
  }
}

function dibujarRastro() {
  ctx.fillStyle = "rgba(252, 252, 252, 0.45)";
  for (const k of estado.visitadas) {
    const [x, y] = k.split(",").map(Number);
    ctx.fillRect(x * CELDA + CELDA / 2 - 2 * PIXEL, y * CELDA + CELDA / 2 - 2 * PIXEL, 4 * PIXEL, 4 * PIXEL);
  }
}

function dibujarObjetos(t) {
  const { mundo, camino, indice } = estado;
  const paso = camino[indice];
  const regadas = new Set(paso.plantas_regadas.map(clave));

  if (mundo.fertilizante.length === 2) {
    const [x, y] = mundo.fertilizante;
    dibujarSprite(sprite("espada"), x * CELDA, y * CELDA);
  }

  if (mundo.avion.length === 2 && indice < estado.indiceChampinon) {
    const [x, y] = mundo.avion;
    const salto = Math.floor(t / 400) % 2 ? -PIXEL : 0;
    dibujarSprite(sprite("champinon"), x * CELDA, y * CELDA + salto);
  }

  mundo.plantas_posicion.forEach(([x, y], n) => {
    if (regadas.has(clave([x, y]))) {
      // Bowser aplastado: medio alto y en grises
      dibujarSprite(sprite("bowser", "bowserDerrotado"), x * CELDA, y * CELDA + CELDA / 2, CELDA, CELDA / 2);
    } else {
      const salto = Math.floor(t / 500 + n) % 2 ? -PIXEL : 0;
      dibujarSprite(sprite("bowser"), x * CELDA, y * CELDA + salto);
    }
  });
}

function dibujarMario(t) {
  const { camino, indice, progreso } = estado;
  const actual = camino[indice];
  const siguiente = camino[indice + 1];
  let [x, y] = actual.pos;

  const enMovimiento = estado.reproduciendo && siguiente;
  if (enMovimiento) {
    const dx = siguiente.pos[0] - x;
    if (dx !== 0) estado.mirando = Math.sign(dx);
    x += dx * progreso;
    y += (siguiente.pos[1] - y) * progreso;
  }
  // Ajustado a la rejilla de pixeles para que no se vea borroso
  const px = Math.round((x * CELDA) / PIXEL) * PIXEL;
  const py = Math.round((y * CELDA) / PIXEL) * PIXEL;

  const marco = enMovimiento && Math.floor(t / 120) % 2 ? "marioB" : "marioA";
  let paleta = "mario";
  if (actual.combustible > 0) paleta = ["mario", "marioPoder1", "marioPoder2"][Math.floor(t / 90) % 3];
  dibujarSprite(sprite(marco, paleta), px, py, CELDA, CELDA, estado.mirando < 0);

  if (actual.fertilizante > 0) {
    const bx = Math.min(px + CELDA - 6 * PIXEL, TAM * CELDA - 10 * PIXEL);
    const by = Math.max(py - 4 * PIXEL, 0);
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(bx, by, 10 * PIXEL, 6 * PIXEL);
    ctx.drawImage(sprite("espada"), bx + PIXEL / 2, by + PIXEL / 2, 5 * PIXEL, 5 * PIXEL);
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillStyle = "#fcfcfc";
    ctx.textBaseline = "top";
    ctx.fillText(`${actual.fertilizante}`, bx + 6 * PIXEL, by + PIXEL + 2);
  }
}

function dibujarTextos(t) {
  const DURACION = 1100;
  estado.textos = estado.textos.filter((f) => t - f.t0 < DURACION);
  ctx.font = "13px 'Press Start 2P'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000";
  for (const f of estado.textos) {
    const avance = (t - f.t0) / DURACION;
    const cx = Math.min(Math.max(f.x * CELDA + CELDA / 2, 60), TAM * CELDA - 60);
    const cy = Math.max(f.y * CELDA - avance * 36, 14);
    ctx.globalAlpha = 1 - avance * avance;
    ctx.strokeText(f.texto, cx, cy);
    ctx.fillStyle = f.color;
    ctx.fillText(f.texto, cx, cy);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "start";
}

function dibujar(t) {
  ctx.imageSmoothingEnabled = false;
  dibujarFondo();
  if (estado.mundo) {
    dibujarRastro();
    dibujarObjetos(t);
    dibujarMario(t);
    dibujarTextos(t);
  }
}

// ---------------------------------------------------------------- Animación

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

function reiniciarAnimacion(reproducir) {
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

let ultimoT = performance.now();
function bucle(t) {
  const dt = Math.min(t - ultimoT, 100);
  ultimoT = t;
  if (estado.reproduciendo) avanzar(dt);
  dibujar(t);
  requestAnimationFrame(bucle);
}

// ---------------------------------------------------------------- HUD, reporte y botones

function actualizarHud() {
  const paso = estado.camino[estado.indice];
  const total = estado.mundo?.plantas_cantidad ?? 0;
  $("hud-espadas").textContent = paso ? paso.fertilizante : 0;
  $("hud-combustible").textContent = relleno(paso ? paso.combustible : 0, 2);
  $("hud-bowsers").textContent = `${paso ? paso.plantas_regadas.length : 0}/${total}`;
  const ultimo = Math.max(estado.camino.length - 1, 0);
  $("hud-paso").textContent = `${relleno(estado.indice, 3)}/${relleno(ultimo, 3)}`;
}

function algoritmoSeleccionado() {
  return document.querySelector("input[name=algoritmo]:checked")?.value ?? null;
}

function actualizarBotones() {
  const hayRecorrido = estado.camino.length > 1;
  const bloqueado = estado.ocupado || !estado.api;
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

function mostrarReporte(algoritmo, stats) {
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

function limpiarReporte() {
  for (const id of ["r-algoritmo", "r-nodos", "r-profundidad", "r-tiempo", "r-costo"]) $(id).textContent = "—";
  $("r-fila-costo").hidden = true;
}

function pintarAlgoritmos() {
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

function pintarLeyenda() {
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

// ---------------------------------------------------------------- Acciones con el backend

function mundoValido(m) {
  return (
    Array.isArray(m.matriz) &&
    m.matriz.length >= TAM &&
    m.matriz.slice(0, TAM).every((fila) => fila.length >= TAM) &&
    m.robot.length === 2
  );
}

async function cargar(ruta) {
  estado.ocupado = true;
  actualizarBotones();
  try {
    const mundo = await estado.api.cargar_mundo(ruta);
    if (!mundoValido(mundo)) throw new Error("El archivo no es una cuadrícula 10x10 con Mario (2)");

    estado.mundo = mundo;
    estado.camino = [{ i: 0, pos: mundo.robot, fertilizante: 0, combustible: 0, plantas_regadas: [], evento: "inicio" }];
    reiniciarAnimacion(false);
    limpiarReporte();
    ocultarCartel();

    const nombre = ruta.split(/[\\/]/).pop();
    $("nombre-archivo").textContent = nombre;
    $("bitacora").replaceChildren();
    registrar(`Mundo "${nombre}" cargado: ${mundo.plantas_cantidad} Bowsers`, "ev-meta");
  } catch (e) {
    registrar(`No se pudo cargar el mundo: ${e.message ?? e}`, "ev-error");
    mostrarCartel("ERROR", "Revisa el archivo del mundo", true);
  } finally {
    estado.ocupado = false;
    actualizarBotones();
  }
}

async function jugar() {
  const algoritmo = algoritmoSeleccionado();
  if (!algoritmo || !estado.mundo) return;

  estado.ocupado = true;
  estado.reproduciendo = false;
  actualizarBotones();
  mostrarCartel("PENSANDO...", `Mario busca su camino con ${NOMBRES[algoritmo]}`);

  try {
    const res = await estado.api.ejecutar(algoritmo);
    mostrarReporte(algoritmo, res.stats);
    $("bitacora").replaceChildren();

    if (res.error || res.camino.length === 0) {
      estado.camino = estado.camino.slice(0, 1);
      reiniciarAnimacion(false);
      Sonido.derrota();
      registrar(`${NOMBRES[algoritmo]}: ${res.error ?? "sin solución"}`, "ev-error");
      mostrarCartel("GAME OVER", "No se encontró solución", true);
      return;
    }

    estado.camino = res.camino;
    ocultarCartel();
    registrar(`${NOMBRES[algoritmo]}: ¡Mario en marcha desde ${coordenada(res.camino[0].pos)}!`);
    Sonido.inicio();
    reiniciarAnimacion(true);
  } catch (e) {
    registrar(`Error al ejecutar: ${e.message ?? e}`, "ev-error");
    mostrarCartel("ERROR", "El backend no pudo ejecutar el algoritmo", true);
  } finally {
    estado.ocupado = false;
    actualizarBotones();
  }
}

async function alConectar() {
  if (estado.api) return;
  estado.api = window.pywebview.api;
  try {
    estado.disponibles = new Set(await estado.api.listar_algoritmos());
  } catch {
    estado.disponibles = null;
  }
  pintarAlgoritmos();
  registrar("Backend listo. ¡Carga un mundo!");
}

// ---------------------------------------------------------------- Eventos de la interfaz

$("btn-archivo").addEventListener("click", async () => {
  const ruta = await estado.api.elegir_archivo();
  if (ruta) cargar(ruta);
});
$("btn-ejemplo").addEventListener("click", () => cargar(RUTA_EJEMPLO));
$("btn-jugar").addEventListener("click", jugar);

document.querySelectorAll("input[name=tipo]").forEach((r) => r.addEventListener("change", pintarAlgoritmos));
$("lista-algoritmos").addEventListener("change", actualizarBotones);

$("btn-pausa").addEventListener("click", () => {
  estado.reproduciendo = !estado.reproduciendo;
  actualizarBotones();
});
$("btn-paso").addEventListener("click", () => {
  if (estado.indice < estado.camino.length - 1) {
    estado.progreso = 0;
    llegarA(estado.indice + 1);
    if (estado.indice === estado.camino.length - 1) terminar();
  }
});
$("btn-reiniciar").addEventListener("click", () => {
  ocultarCartel();
  $("bitacora").replaceChildren();
  registrar("Repetición");
  reiniciarAnimacion(true);
});
$("btn-sonido").addEventListener("click", (e) => {
  Sonido.activo = !Sonido.activo;
  e.currentTarget.textContent = Sonido.activo ? "♪ ON" : "♪ OFF";
  e.currentTarget.setAttribute("aria-pressed", String(Sonido.activo));
});
$("cartel").addEventListener("click", () => {
  if (!estado.ocupado && estado.mundo) ocultarCartel();
});

// ---------------------------------------------------------------- Arranque

pintarLeyenda();
pintarAlgoritmos();
actualizarHud();
document.fonts.ready.then(() => requestAnimationFrame(bucle));

if (window.pywebview?.api?.cargar_mundo) alConectar();
else window.addEventListener("pywebviewready", alConectar);

setTimeout(() => {
  if (!estado.api) registrar("Sin backend: ejecuta la app con python main.py", "ev-error");
}, 2000);
