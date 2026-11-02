from modelo.solver_interfaz import Solver
from modelo.tablero import Tablero
from modelo.estado import Nodo
import heapq

# Igual que greedy (misma heuristica), pero la prioridad es g + h
class SolverAstar(Solver):
    def __init__(self, tablero: Tablero):
            super().__init__(tablero)
    
            self.tablero.busqueda_informada()
            self.pos_plantas = self.tablero.get_pos_plantas()
            self.pos_fertilizante = self.tablero.get_pos_fertilizante()

    def solve(self) -> Nodo | None:
        # Cola de prioridad: (g + h, contador, nodo)
        contador = 0
        raiz = Nodo(self.estado_inicial)
        cola = [(self.heuristica(raiz.estado), contador, raiz)]
        visitados = {} 

        while cola:
            _, _, nodo = heapq.heappop(cola)

            # La meta se revisa al sacar el nodo, no al generarlo: asi el costo es optimo
            if self.es_meta(nodo.estado):
                print(f"¡Solución encontrada! Costo total: {nodo.g}")
                return nodo

            # Si alguno de los visitados es igual a él pero con igual o mayor
            # cantidad de combustible, se descarta
            if self.dominado(visitados, nodo.estado):
                continue

            for hijo in self.expandir(nodo):
                contador += 1
                heapq.heappush(cola, (hijo.g + self.heuristica(hijo.estado), contador, hijo))

        print("No se encontró solución.")
        return None  
