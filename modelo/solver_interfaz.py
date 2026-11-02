from abc import ABC, abstractmethod
from modelo.estado import Estado, Nodo
from modelo.tablero import Tablero
from modelo.readfile import Readfile

# padre = padre
# padre = hijo
def manhattan(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


class Solver(ABC):
    ARRIBA, ABAJO, IZQUIERDA, DERECHA = (0, -1), (0, 1), (-1, 0), (1, 0)
    movimientos = [ARRIBA, ABAJO, DERECHA, IZQUIERDA]

    def __init__(self, tablero: Tablero):
        self.tablero = tablero
        self.nomenc = Readfile().get_nomenc()

        posx_robot, posy_robot = tablero.get_pos_robot()
        total_plantas = tablero.get_cant_plantas()

        self.total_plantas = total_plantas
        self.estado_inicial = Estado(posx_robot, posy_robot, 0, frozenset(), 0, False)
        self.nodos_expandidos = 0

    # Heuristica que usaran los algoritmos de busqueda informada
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

    # Se domina a un estado cuando alguno de los nodos visitados es el mismo 
    # pero con igual o más combustible
    def dominado(self, visitados: dict, estado: Estado) -> bool:
        clave = estado.clave_sin_combustible()
        if visitados.get(clave, -1) >= estado.combustible:
            return True
        visitados[clave] = estado.combustible
        return False

    # expande un nodo y devuelve los nodos vecinos en las direcciones de nx y ny
    # todos los solvers expanden por aqui, asi que el contador sirve para todos
    def expandir(self, nodo: Nodo) -> list[Nodo]:
        self.nodos_expandidos += 1
        estado = nodo.estado
        g = nodo.g + estado.costo_paso()
        return [Nodo(estado.mover(nx, ny, self.tablero.get_posicion(ny, nx)), nodo, g)
                for nx, ny in self.vecinas(estado.x, estado.y)]

    # Retorna el nodo meta o None si no se encontró solucion. De el podemos sacar directamente g, profunidad y camino completo
    # Seria .camino / .estados si no estoy mal xd
    @abstractmethod
    def solve(self) -> Nodo | None:
        pass


