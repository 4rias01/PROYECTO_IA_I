from typing import NamedTuple
from modelo.readfile import Readfile

_NOMENC = Readfile().get_nomenc()
_PLANTA = _NOMENC["PLANTA"]
_FERTILIZANTE = _NOMENC["FERTILIZANTE"]
_AVION = _NOMENC["AVION"]

COMBUSTIBLE_AVION = 30
CARGA_FERTILIZANTE = 2

# estados inmutables; solo lo que cambia durante una busqueda
class Estado(NamedTuple):
    x: int
    y: int
    fertilizante: int
    regadas: frozenset # posiciones (x, y) de las plantas ya regadas. Mantengo el frozenset como ustedes mushashos lo tenian hecho
    combustible: int
    avion_tomada: bool

    # el costo del paso cambia si tenemos o no combustible, aja
    def costo_paso(self) -> float:
        return 0.5 if self.combustible > 0 else 1

    # la vaina es inmutable, el movimiento devuelve el nuevo estado que ese movimiento generaria
    def mover(self, nx: int, ny: int, casilla: str) -> "Estado":
        fertilizante = self.fertilizante
        regadas = self.regadas
        combustible = max(self.combustible - 1, 0)
        avion_tomada = self.avion_tomada

        if casilla == _PLANTA:
            if fertilizante > 0 and (nx, ny) not in regadas:
                fertilizante -= 1
                regadas = regadas | {(nx, ny)}
        elif casilla == _FERTILIZANTE:
            fertilizante = CARGA_FERTILIZANTE
        elif casilla == _AVION:
            if not avion_tomada:
                avion_tomada = True
                combustible = COMBUSTIBLE_AVION

        return Estado(nx, ny, fertilizante, regadas, combustible, avion_tomada)

# los nodos. Estos guardan el estado de arriba y la informacion que se ha ido acumulando de la ruta en especifico.
# y el puntero a su padre para que luego podamos reconstruir el camino
class Nodo:
    __slots__ = ("estado", "padre", "g", "profundidad")

    def __init__(self, estado: Estado, padre: "Nodo | None" = None, g: float = 0):
        self.estado = estado
        self.padre = padre
        self.g = g
        self.profundidad = 0 if padre is None else padre.profundidad + 1

    # lo que haciamos en los solvers generalizado; devuelve la lista de posiciones desde el inicio hasta este nodo
    def camino(self) -> list[list[int]]:
        pos = []
        nodo = self
        while nodo is not None:
            pos.append([nodo.estado.x, nodo.estado.y])
            nodo = nodo.padre
        pos.reverse()
        return pos
