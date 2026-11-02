// Dibujo del tablero en el canvas. Solo lee el estado; nunca lo modifica salvo la lista de textos flotantes.

import { TAM, CELDA, PIXEL, PARED } from "./constantes.js";
import { $, clave } from "./util.js";
import { estado } from "./estado.js";
import { sprite } from "./sprites.js";

const lienzo = $("tablero");
const ctx = lienzo.getContext("2d");

export function textoFlotante(texto, [x, y], color) {
  estado.textos.push({ texto, x, y, color, t0: performance.now() });
}

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

export function dibujar(t) {
  ctx.imageSmoothingEnabled = false;
  dibujarFondo();
  if (estado.mundo) {
    dibujarRastro();
    dibujarObjetos(t);
    dibujarMario(t);
    dibujarTextos(t);
  }
}
