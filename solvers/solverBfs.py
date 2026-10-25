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
        pass
