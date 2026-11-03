// Punto de entrada de la interfaz de AgroBot (estética 8-bit):
// Mario = AgroBot, Bowser = cultivo seco, espada = fertilizante, champiñón = avioneta
//
// Módulos: constantes · util · estado · api (pywebview) · sprites · sonido
//          render (canvas) · ui (HUD, reporte, listas) · animacion (reproducción) · acciones (flujos)
// Este archivo solo conecta los eventos de la página y arranca.

import { $ } from "./util.js";
import { api } from "./api.js";
import { estado } from "./estado.js";
import { Sonido } from "./sonido.js";
import { registrar, ocultarCartel, pintarAlgoritmos, pintarLeyenda, actualizarHud, actualizarBotones } from "./ui.js";
import { iniciarBucle, alternarPausa, pasoManual, repetir } from "./animacion.js";
import { conectar, cargarEjemplo, elegirYCargar, jugar } from "./acciones.js";

// ---------------------------------------------------------------- Eventos de la interfaz

$("btn-archivo").addEventListener("click", elegirYCargar);
$("btn-ejemplo").addEventListener("click", cargarEjemplo);
$("btn-jugar").addEventListener("click", jugar);

document.querySelectorAll("input[name=tipo]").forEach((r) => r.addEventListener("change", pintarAlgoritmos));
$("lista-algoritmos").addEventListener("change", actualizarBotones);

$("btn-pausa").addEventListener("click", alternarPausa);
$("btn-paso").addEventListener("click", pasoManual);
$("btn-reiniciar").addEventListener("click", repetir);
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
iniciarBucle();
api.cuandoListo(conectar);

setTimeout(() => {
  if (!api.disponible()) registrar("Sin backend: ejecuta la app con python main.py", "ev-error");
}, 2000);
