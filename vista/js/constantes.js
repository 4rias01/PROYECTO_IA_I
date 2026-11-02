// Constantes de la interfaz: geometría del tablero y catálogo de algoritmos

export const TAM = 10;          // celdas por lado
export const CELDA = 64;        // px de canvas por celda (sprite de 16px ampliado x4)
export const PIXEL = CELDA / 16;
export const PARED = "1";
export const RUTA_EJEMPLO = "modelo/tableros/lab.txt";

export const ALGORITMOS = {
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
export const NOMBRES = Object.fromEntries(Object.values(ALGORITMOS).flat().map((a) => [a.id, a.nombre]));
// Solo estos algoritmos muestran el costo en el reporte (según el enunciado)
export const CON_COSTO = new Set(["costo", "astar"]);
