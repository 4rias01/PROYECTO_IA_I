from collections import deque
from solver_interfaz import Solver
from tablero import Tablero
import copy

class SolverBfs(Solver):
    def __init__(self, tablero: Tablero):
        super().__init__(tablero)

        self.queue = deque([(self.initial_state, [self.initial_state])])
        self.visitados = {self.initial_state.get_state()}

    def solve(self) -> tuple[float, list[list[int]]]:
        while self.queue:
            estado_actual, camino = self.queue.popleft()

            if estado_actual.isWin():
                print(f"¡Solución encontrada! Costo total: {estado_actual.get_costo()}")
                return (estado_actual.get_costo(),
                        [list(estado.get_pos_robot()) for estado in camino])

            for nueva_x, nueva_y in self.casillas_vecinas(estado_actual):
                nuevo_estado = copy.deepcopy(estado_actual)
                casilla = self.tablero.get_posicion(nueva_y, nueva_x)
                nuevo_estado.paso((nueva_x, nueva_y), casilla)

                tupla_estado = nuevo_estado.get_state()
                if tupla_estado in self.visitados:
                    continue
                self.visitados.add(tupla_estado)
                self.queue.append((nuevo_estado, camino + [nuevo_estado]))

        print("No se encontró solución.")
        return (-1, [])
