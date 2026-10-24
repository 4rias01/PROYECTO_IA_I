class Tablero:
    __slots__ = ("pos_robot", "count_plants", "nomenc", "tablero",
                 "pos_plantas", "pos_fertilizante", "pos_avion")
    
    def __init__(self, nomenc, matrix) -> None:
        self.nomenc = nomenc
        self.tablero = matrix
        self.pos_robot, self.count_plants = self.helper(matrix)
    
    def helper(self, mat: list[list[int]]):
        count_plants = 0
        pos_robot = []

        for i in range(10):
            for j in range(10):
                if mat[i][j] == self.nomenc["ROBOT"]:
                    pos_robot = (j, i)
                elif mat[i][j] == self.nomenc["PLANTA"]:
                    count_plants += 1
        return (pos_robot, count_plants)

    def busqueda_informada(self, mat: list[list[int]]):
        pos_plantas = []
        pos_fertilizante = []
        pos_avion = []
        for i in range(10):
            for j in range(10):
                if mat[i][j] == self.nomenc["PLANTA"]:
                    pos_plantas.append((j, i))
                elif mat[i][j] == self.nomenc["FERTILIZANTE"]:
                    pos_fertilizante= (j, i)
                elif mat[i][j] == self.nomenc["AVION"]:
                    pos_avion = (j, i)
        self.pos_plantas = pos_plantas
        self.pos_fertilizante= pos_fertilizante
        self.pos_avion = pos_avion
    
    def get_pos_plantas(self):
        return self.pos_plantas

    def get_pos_avion(self):
        return self.pos_avion

    def get_pos_fertilizante(self):
        return self.pos_fertilizante

    def get_pos_robot(self):
        return self.pos_robot

    def get_cant_plantas(self):
        return self.count_plants

    def get_nomenc(self):
        return self.nomenc

    def get_posicion(self, posy, posx):
        return self.tablero[posy][posx]