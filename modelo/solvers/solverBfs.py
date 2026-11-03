from collections import deque
from modelo.solver_interfaz import Solver
from modelo.tablero import Tablero
from modelo.estado import Nodo

class SolverBfs(Solver):
    def __init__(self, tablero: Tablero):
        super().__init__(tablero)

    def solve(self) -> tuple[float, list[list[int]]]:
        raiz = Nodo(self.estado_inicial)
        cola = deque([raiz])
        visitados = {raiz.estado.clave_sin_combustible()}

        while cola:
            nodo = cola.popleft()

            if self.es_meta(nodo.estado):
                print(f"¡Solución encontrada! Costo total: {nodo.g}")
                return (nodo.g, nodo.camino())

            for hijo in self.expandir(nodo):
                clave = hijo.estado.clave_sin_combustible()
                if clave in visitados:
                    continue
                visitados.add(clave)
                cola.append(hijo)

        print("No se encontró solución.")
        return (-1, [])
