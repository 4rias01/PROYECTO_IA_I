from solver_interfaz import Solver
from tablero import Tablero
from state import State
import heapq
import copy

def manhattan(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

class SolverGreedy(Solver):
    def __init__(self, tablero: Tablero):
        super().__init__(tablero)

        self.tablero.busqueda_informada()
        plantas = self.tablero.get_pos_plantas()
        avion = self.tablero.get_pos_avion()
        fertilizante = self.tablero.get_pos_fertilizante()
        self.initial_state.inicializar_busqueda_informada(plantas, avion, fertilizante)

        # Cola de prioridad: (heuristica, contador, estado, camino)
        # Los empates en la heurística se rompen por el contador (que evita comparar estados)
        self.contador = 0
        self.queue = [(self.heuristica(self.initial_state), self.contador,
                       self.initial_state, [self.initial_state])]
        self.visitados = set()

    def heuristica(self, estado: State) -> int:
        pos_robot = estado.get_pos_robot()
        plantas_sin_regar = estado.get_plantas_sin_regar()

        # Sin fertilizante: distancia hasta el fertilizante
        if estado.cant_fertilizante == 0:
            return manhattan(pos_robot, estado.get_pos_fertilizante())

        # Con fertilizante: suma de distancias a las plantas sin regar
        return sum(manhattan(pos_robot, planta) for planta in plantas_sin_regar)

    def solve(self) -> tuple[float, list[list[int]]]:
        while self.queue:
            _, _, estado_actual, camino = heapq.heappop(self.queue)

            if estado_actual.isWin():
                print(f"¡Solución encontrada! Costo total: {estado_actual.get_costo()}")
                return (estado_actual.get_costo(),
                        [list(estado.get_pos_robot()) for estado in camino])

            tupla_estado = estado_actual.get_state()
            if tupla_estado in self.visitados:
                continue
            self.visitados.add(tupla_estado)

            posx, posy = estado_actual.get_pos_robot()

            for nueva_x, nueva_y in self.casillas_vecinas(estado_actual):
                nuevo_estado = copy.deepcopy(estado_actual)
                casilla = self.tablero.get_posicion(nueva_y, nueva_x)
                nuevo_estado.paso((nueva_x, nueva_y), casilla)

                self.contador += 1
                heapq.heappush(self.queue, (self.heuristica(nuevo_estado), self.contador,
                                            nuevo_estado, camino + [nuevo_estado]))

        print("No se encontró solución.")
        return (-1, [])
