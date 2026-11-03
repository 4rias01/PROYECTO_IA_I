from modelo.solver_interfaz import Solver
from modelo.tablero import Tablero
from modelo.estado import Nodo
import heapq

# Igual que greedy (misma heuristica), pero la prioridad es g + h
class SolverCosto(Solver):
    def solve(self) -> tuple[float, list[list[int]]]:
        # Cola de prioridad: (g + h, contador, nodo)
        contador = 0
        raiz = Nodo(self.estado_inicial)
        cola = [(0, contador, raiz)]
        visitados = {} 

        while cola:
            _, _, nodo = heapq.heappop(cola)

            # La meta se revisa al sacar el nodo, no al generarlo: asi el costo es optimo
            if self.es_meta(nodo.estado):
                print(f"¡Solución encontrada! Costo total: {nodo.g}")
                return (nodo.g, nodo.camino())

            # No visitamos los nodos en los que ya hemos estado a no ser que su cantidad de combustible sea mejor.
            if self.dominado(visitados, nodo.estado):
                continue

            for hijo in self.expandir(nodo):
                contador += 1
                heapq.heappush(cola, (hijo.g, contador, hijo))

        print("No se encontró solución.")
        return (-1, [])
