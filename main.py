import sys
from readfile import Readfile
from tablero import Tablero
from solvers.solverDfs import SolverDfs
from solvers.solverBfs import SolverBfs

SOLVERS = {"dfs": SolverDfs, "bfs": SolverBfs}


if __name__ == '__main__':
    nombre = sys.argv[1] if len(sys.argv) > 1 else "dfs"
    if nombre not in SOLVERS:
        print(f"Solver '{nombre}' no existe. Opciones: {', '.join(SOLVERS)}")
        sys.exit(1)

    rd = Readfile()
    matrix = rd.file_to_matrix("tableros/lab.txt")

    tablero = Tablero(matrix)

    solver = SOLVERS[nombre](tablero)
    costo, camino = solver.solve()
    print(camino)
