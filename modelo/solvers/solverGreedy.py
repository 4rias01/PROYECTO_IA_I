from modelo.solver_interfaz import Solver
from modelo.tablero import Tablero
from modelo.estado import Estado, Nodo
import heapq

def manhattan(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

class SolverGreedy(Solver):
    def __init__(self, tablero: Tablero):
        super().__init__(tablero)

        self.tablero.busqueda_informada()
        self.pos_plantas = self.tablero.get_pos_plantas()
        self.pos_fertilizante = self.tablero.get_pos_fertilizante()

    def heuristica(self, estado: Estado) -> int:
        pos_robot = (estado.x, estado.y)

        # Sin fertilizante: distancia hasta el fertilizante
        if estado.fertilizante == 0:
            return manhattan(pos_robot, self.pos_fertilizante)

        # Con fertilizante: suma de distancias a las plantas sin regar
        return sum(manhattan(pos_robot, planta) for planta in self.pos_plantas
                   if planta not in estado.regadas)

    def solve(self) -> tuple[float, list[list[int]]]:
        # Cola de prioridad: (heuristica, contador, nodo)
        # Los empates en la heurística se rompen por el contador (que evita comparar nodos)
        contador = 0
        raiz = Nodo(self.estado_inicial)
        cola = [(self.heuristica(raiz.estado), contador, raiz)]
        visitados = set()

        while cola:
            _, _, nodo = heapq.heappop(cola)

            if self.es_meta(nodo.estado):
                print(f"¡Solución encontrada! Costo total: {nodo.g}")
                return (nodo.g, nodo.camino())

            if nodo.estado in visitados:
                continue
            visitados.add(nodo.estado)

            for hijo in self.expandir(nodo):
                contador += 1
                heapq.heappush(cola, (self.heuristica(hijo.estado), contador, hijo))

        print("No se encontró solución.")
        return (-1, [])
