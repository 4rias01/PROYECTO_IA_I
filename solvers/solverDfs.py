from solver_interfaz import Solver
from tablero import Tablero
import copy

class SolverDfs(Solver):
    def __init__(self, tablero: Tablero):
        super().__init__(tablero)

        self.queue = [(self.initial_state, [self.initial_state])]
        self.visitados = set()

    def solve(self) -> tuple[float, list[list[int]]]:
        while self.queue:
            estado_actual, camino = self.queue.pop()

            if estado_actual.isWin():
                print(f"¡Solución encontrada! Costo total: {estado_actual.get_costo()}")
                return (estado_actual.get_costo(),
                        [list(estado.get_pos_robot()) for estado in camino])

            
            tupla_estado = estado_actual.get_state()
            if tupla_estado in self.visitados:
                continue
            self.visitados.add(tupla_estado)

            for nueva_x, nueva_y in self.casillas_vecinas(estado_actual):

                # 1. Clonar el estado actual
                nuevo_estado = copy.deepcopy(estado_actual)

                # 2. Obtener la casilla usando tu método seguro
                casilla = self.tablero.get_posicion(nueva_y, nueva_x)

                # 3. Aplicar el paso al nuevo estado
                nuevo_estado.paso((nueva_x, nueva_y), casilla)
                self.queue.append((nuevo_estado, camino + [nuevo_estado]))

        print("No se encontró solución.")
        return (-1, [])
