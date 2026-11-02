import sys
from modelo.readfile import Readfile
from modelo.tablero import Tablero
from modelo.solvers.solverDfs import SolverDfs
from modelo.solvers.solverBfs import SolverBfs
from modelo.solvers.solverGreedy import SolverGreedy
from modelo.solvers.solverAstar import SolverAstar

from controlador.controller import Controller
from bridge import Bridge

SOLVERS = {"dfs": SolverDfs, "bfs": SolverBfs, "greedy": SolverGreedy, "astar": SolverAstar}


if __name__ == '__main__':
    Bridge(Controller()).run()

    nombre = sys.argv[1] if len(sys.argv) > 1 else "dfs"
    if nombre not in SOLVERS:
        print(f"Solver '{nombre}' no existe. Opciones: {', '.join(SOLVERS)}")
        sys.exit(1)

    rd = Readfile()
    matrix = rd.file_to_matrix("modelo/tableros/lab.txt")

    tablero = Tablero(matrix)

    solver = SOLVERS[nombre](tablero)
    costo, camino = solver.solve()
    print(camino)
