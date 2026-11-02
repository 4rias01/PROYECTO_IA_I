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

    def heuristica(self, estado: Estado) -> float:
        pos_robot = (estado.x, estado.y)
        plantas_sin_regar = [planta for planta in self.pos_plantas if planta not in estado.regadas]

        # Validar si ya se regaron todas las plantas
        if not plantas_sin_regar:
            return 0.0

        # Sin fertilizante: distancia al fertilizante + distancia del fertilizante a la planta más lejana
        if estado.fertilizante <= 0:
            robot_a_fertilizante = manhattan(pos_robot, self.pos_fertilizante)
            fertilizante_a_planta = max([manhattan(self.pos_fertilizante, planta) 
                                        for planta in plantas_sin_regar])
            return 0.5 * (robot_a_fertilizante + fertilizante_a_planta)
        else:
            # Con fertilizante: distancia del robot a la planta más lejana
            robot_a_planta = max([manhattan(pos_robot, planta) 
                                for planta in plantas_sin_regar])
        return 0.5 * robot_a_planta
    
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
