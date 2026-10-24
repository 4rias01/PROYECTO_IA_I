from readfile import Readfile
from tablero import Tablero
from solvers.solverDfs import SolverDfs


if __name__ == '__main__':
    rd = Readfile()
    nomenclatura = rd.read_nomenc("tableros/nomenc.txt")
    matrix = rd.file_to_matrix("tableros/lab.txt")

    tablero = Tablero(nomenclatura, matrix)

    solver = SolverDfs(tablero)
    solver.run()