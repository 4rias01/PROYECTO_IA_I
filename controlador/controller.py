from modelo.solvers.solverBfs import SolverBfs
from modelo.solvers.solverDfs import SolverDfs
from modelo.solvers.solverGreedy import SolverGreedy
from modelo.solvers.solverAstar import SolverAstar
from modelo.solvers.solverCosto import SolverCosto

from modelo.readfile import Readfile
from modelo.tablero import Tablero
from modelo.estado import Estado, Nodo

import time


class Controller:
    SOLVERS = {
        "bfs": SolverBfs,
        "costo": SolverCosto,
        "dfs": SolverDfs,
        "greedy": SolverGreedy,
        "astar": SolverAstar,
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
        nodo = solver.solve()
        tiempo = time.perf_counter() - inicio
        valor = solver.nodos_expandidos

        if nodo is None:
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
            "camino": self._serializar_camino(nodo),
            "stats": {
                "nodos_expandidos": valor,
                "profundidad": nodo.profundidad,
                "tiempo_seg": tiempo,
                "costo": nodo.g,
            },
        }

    # Serializa el camino hasta el nodo meta en pasos
    def _serializar_camino(self, meta: Nodo) -> list[dict]:
        estados = meta.estados()
        pasos = []
        for i, est in enumerate(estados):
            prev = estados[i - 1] if i > 0 else None
            pasos.append(self._paso_dict(i, est, prev))
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

    # Revisa si algo cambio
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