import heapq

from modelo.estado import Nodo
from modelo.solver_interfaz import Solver
from modelo.tablero import Tablero


class SolverUcs(Solver):
    """Busca la solución de menor costo acumulado usando Costo Uniforme."""

    def __init__(self, tablero: Tablero):
        super().__init__(tablero)
        self.nodos_expandidos = 0

    def solve(self) -> tuple[float, list[list[int]]]:
        raiz = Nodo(self.estado_inicial)

        # La cola guarda (costo acumulado, orden de inserción, nodo).
        # El contador resuelve empates sin intentar comparar objetos Nodo.
        contador = 0
        cola = [(raiz.g, contador, raiz)]

        # Para cada estado, recordamos el costo de la ruta más barata conocida.
        mejor_costo = {raiz.estado: raiz.g}
        self.nodos_expandidos = 0

        while cola:
            costo, _, nodo = heapq.heappop(cola)

            # Puede quedar en la cola una ruta que ya fue superada por otra mejor.
            if costo > mejor_costo.get(nodo.estado, float("inf")):
                continue

            # En Costo Uniforme, la primera meta extraída tiene costo óptimo.
            if self.es_meta(nodo.estado):
                print(f"¡Solución encontrada! Costo total: {nodo.g}")
                return (nodo.g, nodo.camino())

            self.nodos_expandidos += 1

            for hijo in self.expandir(nodo):
                costo_conocido = mejor_costo.get(hijo.estado, float("inf"))

                # No agregamos ciclos ni rutas más caras que ya conocemos.
                if hijo.g >= costo_conocido:
                    continue

                mejor_costo[hijo.estado] = hijo.g
                contador += 1
                heapq.heappush(cola, (hijo.g, contador, hijo))

        print("No se encontró solución.")
        return (-1, [])
