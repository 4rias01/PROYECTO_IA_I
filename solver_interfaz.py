
from abc import ABC, abstractmethod

# padre = padre
# padre = hijo


# initial_state[posy_robot][posx_robot][combustible0][tiene_fertilizante][cant_plantas]
# matrix[n][m][30][2][plantas]

class GameState:
    __slots__ = ("robot_y", "robot_x", "count_plants")
    def __init__(self, matrix: list[list[int]]) -> None:
        self.robot_y, self.robot_x, self.count_plants = self.helper(matrix)
    
    def helper(self, mat: list[list[int]]):
        robot_x = -1
        robot_y = -1
        count_plants = 0
        for i in range(10):
            for j in range(10):
                if mat[i][j] == 2:
                    robot_x = j
                    robot_y = i
                elif mat[i][j] == 3:
                    count_plants += 1
        return (robot_y, robot_x, count_plants)

class Solver(ABC):


    def game_state(self, matrix: list[list[int]]) -> GameState:
        return GameState(matrix)
        
        
    @abstractmethod
    def solve() -> tuple[int, list[list[int]]]:
        pass


