from modelo.solvers.solverBfs import SolverBfs
from modelo.solvers.solverDfs import SolverDfs
from modelo.solvers.solverGreedy import SolverGreedy

from modelo.readfile import Readfile
from modelo.tablero import Tablero
from modelo.estado import Estado

import time


class Controller:
    SOLVERS = {
        "bfs": SolverBfs,
        "dfs": SolverDfs,
        "greedy": SolverGreedy,
    }

    def __init__(self):
        self.tablero = None

    def listar_algoritmos(self) -> list[str]:
        return list(self.SOLVERS.keys())

    #Inicializa la matriz y serializa sus datos
    def cargar_mundo(self, path: str) -> dict:
        matrix = Readfile().file_to_matrix(path)
        tablero = Tablero(matrix)
        tablero.busqueda_informada()  # Inicializa pos_plantas / pos_fertilizante / pos_avion
        self.tablero = tablero

        plantas_posicion = []
        for p in tablero.get_pos_plantas():
            plantas_posicion.append(list(p))

        return {
            "matriz": matrix,
            "robot": list(tablero.get_pos_robot()),
            "fertilizante": list(tablero.get_pos_fertilizante()),
            "avion": list(tablero.get_pos_avion()),
            "plantas_cantidad": tablero.get_cant_plantas(),
            "plantas_posicion": plantas_posicion,
        }

    #Ejecuta un solver con la matriz previamente inicializada
    def ejecutar(self, algoritmo: str) -> dict:
        if self.tablero is None:
            raise ValueError("Llamar primero a cargar_mundo()")
        if algoritmo not in self.SOLVERS:
            raise ValueError(f"Algoritmo '{algoritmo}' no existe")

        solver = self.SOLVERS[algoritmo](self.tablero)

        inicio = time.perf_counter()
        costo, camino = solver.solve()
        tiempo = time.perf_counter() - inicio
        #Parche temporal en lo que se le pone un contador de nodos expandidos al solver
        try:
            valor = solver.nodos_expandidos
        except AttributeError:
            valor = -1

        if costo == -1:
            return {
                "error": "No se encontró solución",
                "camino": [],
                "stats": {
                    "nodos_expandidos": valor,
                    "profundidad": 0,
                    "tiempo_seg": tiempo,
                    "costo": -1,
                },
            }

        return {
            "camino": self._serializar_camino(camino, solver.estado_inicial),
            "stats": {
                "nodos_expandidos": valor,
                "profundidad": len(camino) - 1,
                "tiempo_seg": tiempo,
                "costo": costo,
            },
        }

    #Serializa el camino que devuelve el solver al ejecutar
    def _serializar_camino(self, camino: list[list[int]], estado_inicial: Estado) -> list[dict]:
        """
        'camino' es la lista de posiciones [x, y] que devuelve nodo.camino().
        Como no incluye fertilizante/combustible/regadas, recorremos de nuevo
        desde el estado inicial para recuperar los datos de cada paso.
        """

        #Posición inicial
        x0, y0 = self.tablero.get_pos_robot()

        #Estado inicial, en la posición inicial, sin fertilizante, sin plantas regadas, sin combustibles y sin avioneta
        est = estado_inicial

        #Lista de pasos empezando con el paso inicial. Un paso es un estado serializado
        pasos = [self._paso_dict(0, est, None)]
        prev = est 

        #Añade todos los pasos según el camino (que es la lista de movimientos)
        for i, (x, y) in enumerate(camino[1:], start=1):
            casilla = self.tablero.get_posicion(y, x)
            est = est.mover(x, y, casilla)
            pasos.append(self._paso_dict(i, est, prev))
            prev = est

        return pasos

    #Serializa un estado transformándolo en paso.
    def _paso_dict(self, i: int, est: Estado, prev: Estado | None) -> dict:
        plantas_regadas = []
        for p in est.regadas:
            plantas_regadas.append(list(p))

        return {
            "i": i,
            "pos": [est.x, est.y],
            "fertilizante": est.fertilizante,
            "combustible": est.combustible,
            "plantas_regadas": plantas_regadas,
            "evento": self._detectar_evento(est, prev),
        }

#Revisa si algo cambió. Si el estado anterior es none, es el estado inicial.
# Si el combustible aumentó, se cogió el avión. Si el fertilizante aumentó, se cogió el fertilizante, 
#y si aumentó la cantidad de plantas regadas, se regó una planta
    def _detectar_evento(self, est: Estado, prev: Estado | None) -> str | None:
        if prev is None:
            return "inicio"
        if est.combustible > prev.combustible:
            return "avion"
        if est.fertilizante > prev.fertilizante:
            return "recarga_fertilizante"
        if len(est.regadas) > len(prev.regadas):
            return "riego"
        return None