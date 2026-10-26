## listar_algoritmos() -> string[]
## cargar_mundo(path: string) -> {
    matriz: string[][],
    robot: [x, y],
    fertilizante: [x, y],
    avion: [x, y],
    plantas_cantidad: int,
    plantas_posicion: [x, y][]
}

OJO: matriz es string[][], no number[][]. Compara con "1", no con 1.

## ejecutar(algoritmo: string) -> {
    camino: Step[],
    stats: Stats
}

Step  = { i, pos: [x,y], fertilizante, combustible,
          plantas_regadas: [x,y][], evento }
evento: "inicio" | "avion" | "recarga_fertilizante" | "riego" | null

Stats = { nodos_expandidos, profundidad, tiempo_seg, costo }

Si no hay solución: { camino: [], stats: {...}, error: "..." }

## Cómo se llama desde TypeScript

PyWebView inyecta un objeto global `window.pywebview.api` con los 3 métodos.
Todos devuelven `Promise`, así que se usan con `await`.

```ts
// window.pywebview.api NO existe al cargar la página.
// PyWebView lo inyecta asíncronamente. Escucha el evento primero:
window.addEventListener("pywebviewready", async () => {
  // Aquí ya puedes llamar los métodos:
  const algoritmos = await window.pywebview.api.listar_algoritmos();
  console.log(algoritmos);  // ["bfs", "dfs", "greedy"]

  const mundo = await window.pywebview.api.cargar_mundo("modelo/tableros/lab.txt");
  console.log(mundo.robot);  // [4, 0]

  try {
    const resultado = await window.pywebview.api.ejecutar("bfs");
    console.log(resultado.camino);   // Step[]
    console.log(resultado.stats);    // Stats
  } catch (err) {
    // Si Python lanza ValueError (algo no existe, no cargó mundo, etc.),
    // la Promise se rechaza y cae aquí:
    console.error("Falló:", err);
  }
});


## Declaración de tipos para TypeScript

Crea `view/src/types.d.ts`:

```ts
interface Mundo {
  matriz: string[][];
  robot: [number, number];
  fertilizante: [number, number];
  avion: [number, number];
  plantas_cantidad: number;
  plantas_posicion: [number, number][];
}

interface Step {
  i: number;
  pos: [number, number];
  fertilizante: number;
  combustible: number;
  plantas_regadas: [number, number][];
  evento: "inicio" | "avion" | "recarga_fertilizante" | "riego" | null;
}

interface Stats {
  nodos_expandidos: number;
  profundidad: number;
  tiempo_seg: number;
  costo: number;
}

interface Resultado {
  camino: Step[];
  stats: Stats;
  error?: string;
}

declare global {
  interface Window {
    pywebview: {
      api: {
        listar_algoritmos(): Promise<string[]>;
        cargar_mundo(path: string): Promise<Mundo>;
        ejecutar(algoritmo: string): Promise<Resultado>;
      };
    };
  }
}
export {};
```
