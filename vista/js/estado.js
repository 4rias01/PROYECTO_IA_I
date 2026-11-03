// Estado compartido de la interfaz (único objeto mutable; los demás módulos lo importan)

export const estado = {
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
