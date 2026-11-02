from modelo.solver_interfaz import Solver
from modelo.tablero import Tablero
from modelo.estado import Nodo

class SolverDfs(Solver):
    def __init__(self, tablero: Tablero):
        super().__init__(tablero)

    def solve(self) -> tuple[float, list[list[int]]]:
        pila = [Nodo(self.estado_inicial)]
        visitados = set()

        while pila:
            nodo = pila.pop()

            if self.es_meta(nodo.estado):
                print(f"¡Solución encontrada! Costo total: {nodo.g}")
                return (nodo.g, nodo.camino())

            # Antes con el combustible ibamos en un ciclo arriba a abajo. 
            # Sin combustible la posicion de la avioneta si se toma como un estado ya visto.
            # Asi que DFS no entra en ese ciclo jeje
            clave = nodo.estado.clave_sin_combustible()
            if clave in visitados:
                continue
            visitados.add(clave)

            # Se apilan al revés para que el operador preferido quede encima y salga primero
            pila.extend(reversed(self.expandir(nodo)))

        print("No se encontró solución.")
        return (-1, [])
