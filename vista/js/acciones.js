// Flujos que combinan backend, estado y pantalla: conectar, cargar un mundo y ejecutar un algoritmo

import { TAM, RUTA_EJEMPLO, NOMBRES } from "./constantes.js";
import { $, coordenada } from "./util.js";
import { estado } from "./estado.js";
import { api } from "./api.js";
import { Sonido } from "./sonido.js";
import { reiniciarAnimacion } from "./animacion.js";
import {
  registrar, limpiarBitacora, mostrarCartel, ocultarCartel, mostrarReporte, limpiarReporte,
  pintarAlgoritmos, algoritmoSeleccionado, actualizarBotones,
} from "./ui.js";

function mundoValido(m) {
  return (
    Array.isArray(m.matriz) &&
    m.matriz.length >= TAM &&
    m.matriz.slice(0, TAM).every((fila) => fila.length >= TAM) &&
    m.robot.length === 2
  );
}

export async function cargar(ruta) {
  estado.ocupado = true;
  actualizarBotones();
  try {
    const mundo = await api.cargarMundo(ruta);
    if (!mundoValido(mundo)) throw new Error("El archivo no es una cuadrícula 10x10 con Mario (2)");

    estado.mundo = mundo;
    estado.camino = [{ i: 0, pos: mundo.robot, fertilizante: 0, combustible: 0, plantas_regadas: [], evento: "inicio" }];
    reiniciarAnimacion(false);
    limpiarReporte();
    ocultarCartel();

    const nombre = ruta.split(/[\\/]/).pop();
    $("nombre-archivo").textContent = nombre;
    limpiarBitacora();
    registrar(`Mundo "${nombre}" cargado: ${mundo.plantas_cantidad} Bowsers`, "ev-meta");
  } catch (e) {
    registrar(`No se pudo cargar el mundo: ${e.message ?? e}`, "ev-error");
    mostrarCartel("ERROR", "Revisa el archivo del mundo", true);
  } finally {
    estado.ocupado = false;
    actualizarBotones();
  }
}

export async function cargarEjemplo() {
  await cargar(RUTA_EJEMPLO);
}

export async function elegirYCargar() {
  const ruta = await api.elegirArchivo();
  if (ruta) await cargar(ruta);
}

export async function jugar() {
  const algoritmo = algoritmoSeleccionado();
  if (!algoritmo || !estado.mundo) return;

  estado.ocupado = true;
  estado.reproduciendo = false;
  actualizarBotones();
  mostrarCartel("PENSANDO...", `Mario busca su camino con ${NOMBRES[algoritmo]}`);

  try {
    const res = await api.ejecutar(algoritmo);
    mostrarReporte(algoritmo, res.stats);
    limpiarBitacora();

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

let conectado = false;
export async function conectar() {
  if (conectado) return;
  conectado = true;
  try {
    estado.disponibles = new Set(await api.listarAlgoritmos());
  } catch {
    estado.disponibles = null;
  }
  pintarAlgoritmos();
  registrar("Backend listo. ¡Carga un mundo!");
}
