
from abc import ABC, abstractmethod
from modelo.estado import Estado, Nodo
from modelo.tablero import Tablero
from modelo.readfile import Readfile

# padre = padre
# padre = hijo

class Solver(ABC):
    ARRIBA, ABAJO, IZQUIERDA, DERECHA = (0, -1), (0, 1), (-1, 0), (1, 0)
    movimientos = [ARRIBA, ABAJO, IZQUIERDA, DERECHA]

    def __init__(self, tablero: Tablero):
        self.tablero = tablero
        self.nomenc = Readfile().get_nomenc()

        posx_robot, posy_robot = tablero.get_pos_robot()
        total_plantas = tablero.get_cant_plantas()

        self.total_plantas = total_plantas
        self.estado_inicial = Estado(posx_robot, posy_robot, 0, frozenset(), 0, False)
        self.nodos_expandidos = 0


    # Retorna las casillas alcanzables en el orden de preferencia de self.movimientos
    def vecinas(self, posx: int, posy: int) -> list[tuple[int, int]]:
        casillas_vecinas = []

        for dx, dy in self.movimientos:
            nx = posx + dx
            ny = posy + dy

            # Validar que no se salga de los límites del tablero (10x10)
            if 0 <= nx < 10 and 0 <= ny < 10:
                casilla = self.tablero.get_posicion(ny, nx)

                if casilla != self.nomenc["PARED"]:
                    casillas_vecinas.append((nx, ny))

        return casillas_vecinas

    def es_meta(self, estado: Estado) -> bool:
        return len(estado.regadas) == self.total_plantas

    # expande un nodo y devuelve los nodos vecinos en las direcciones de nx y ny
    # todos los solvers expanden por aqui, asi que el contador sirve para todos
    def expandir(self, nodo: Nodo) -> list[Nodo]:
        self.nodos_expandidos += 1
        estado = nodo.estado
        g = nodo.g + estado.costo_paso()
        return [Nodo(estado.mover(nx, ny, self.tablero.get_posicion(ny, nx)), nodo, g)
                for nx, ny in self.vecinas(estado.x, estado.y)]

    # Retorna (costo, camino), donde camino es la lista de posiciones [x, y] del robot
    @abstractmethod
    def solve(self) -> tuple[float, list[list[int]]]:
        pass


