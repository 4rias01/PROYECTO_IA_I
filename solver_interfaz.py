
from abc import ABC, abstractmethod
from state import State
from tablero import Tablero
from readfile import Readfile

# padre = padre
# padre = hijo


# initial_state[posy_robot][posx_robot][combustible0][tiene_fertilizante][cant_plantas]
# matrix[n][m][30][2][plantas]

class Solver(ABC):
    def __init__(self, tablero: Tablero):
        self.tablero = tablero
        self.nomenc = Readfile().get_nomenc()

        posx_robot, posy_robot = tablero.get_pos_robot()
        cant_plantas = tablero.get_cant_plantas()
        self.initial_state = State(posx_robot, posy_robot, cant_plantas)


    def casillas_vecinas(self, estado: State) -> list[tuple[int, int]]:
        posx, posy = estado.get_pos_robot()
        casillas_vecinas = []
        movimientos = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        for dx, dy in movimientos:
            nx = posx + dx
            ny = posy + dy

            # Validar que no se salga de los límites del tablero (10x10)
            if 0 <= nx < 10 and 0 <= ny < 10:
                casilla = self.tablero.get_posicion(ny, nx)

                if casilla != self.nomenc["PARED"]:
                    casillas_vecinas.append((nx, ny))

        return casillas_vecinas

    # Retorna (costo, camino), donde camino es la lista de posiciones [x, y] del robot
    @abstractmethod
    def solve(self) -> tuple[float, list[list[int]]]:
        pass


