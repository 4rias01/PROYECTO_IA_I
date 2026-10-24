from readfile import Readfile
from tablero import Tablero
from solvers.solverDfs import SolverDfs


if __name__ == '__main__':
    rd = Readfile()
    matrix = rd.file_to_matrix("tableros/lab.txt")

    tablero = Tablero(matrix)

    solver = SolverDfs(tablero)
    costo, camino = solver.solve()
    print(camino)