from readfile import Readfile
from tablero import Tablero
from solvers.solverDfs import SolverDfs
from solvers.solverGreedy import SolverGreedy


if __name__ == '__main__':
    rd = Readfile()
    matrix = rd.file_to_matrix("tableros/lab.txt")

    tablero = Tablero(matrix)

    solverDfs = SolverDfs(tablero)
    solverGreedy = SolverGreedy(tablero)
    # costoDfs, caminoDfs = solverDfs.solve()
    costoGreedy, caminoGreedy = solverGreedy.solve()
    print(f"El costo de la solución greedy fue de {costoGreedy}")
    print(caminoGreedy)