// Único punto que conoce a pywebview. Cada función es un método de controlador/controller.py
// (ver controlador/api.md); todas devuelven Promesas.

const backend = () => window.pywebview.api;

export const api = {
  disponible: () => Boolean(window.pywebview?.api),
  listarAlgoritmos: () => backend().listar_algoritmos(),
  elegirArchivo: () => backend().elegir_archivo(),
  cargarMundo: (ruta) => backend().cargar_mundo(ruta),
  ejecutar: (algoritmo) => backend().ejecutar(algoritmo),

  // pywebview inyecta window.pywebview.api de forma asíncrona: llama a `alListo` cuando exista
  cuandoListo(alListo) {
    if (window.pywebview?.api?.cargar_mundo) alListo();
    else window.addEventListener("pywebviewready", alListo);
  },
};
