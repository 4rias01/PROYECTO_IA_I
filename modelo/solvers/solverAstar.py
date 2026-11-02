from modelo.solvers.solverGreedy import SolverGreedy
from modelo.estado import Nodo
import heapq

# Igual que greedy (misma heuristica), pero la prioridad es g + h
class SolverAstar(SolverGreedy):
    def solve(self) -> tuple[float, list[list[int]]]:
        # Cola de prioridad: (g + h, contador, nodo)
        contador = 0
        raiz = Nodo(self.estado_inicial)
        cola = [(self.heuristica(raiz.estado), contador, raiz)]
        visitados = set()

        while cola:
            _, _, nodo = heapq.heappop(cola)

            # La meta se revisa al sacar el nodo, no al generarlo: asi el costo es optimo
            if self.es_meta(nodo.estado):
                print(f"¡Solución encontrada! Costo total: {nodo.g}")
                return (nodo.g, nodo.camino())

            # Como la heuristica es consistente, la primera vez que sale un estado es con su menor g
            if nodo.estado in visitados:
                continue
            visitados.add(nodo.estado)

            for hijo in self.expandir(nodo):
                contador += 1
                heapq.heappush(cola, (hijo.g + self.heuristica(hijo.estado), contador, hijo))

        print("No se encontró solución.")
        return (-1, [])
