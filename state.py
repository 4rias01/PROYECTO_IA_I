
# initial_state[pos_robot][combustible][fertilizante][cant_plantas]
# matrix[n][m][30][2][plantas]

# hay un prolema, y es que si pasa por una planta que ya fue regada
class State:
    def __init__(self, posx_robot, posy_robot, cant_plantas, nomenc):
        self.costo_paso = 1
        self.costo_acum = 0
        self.plantas_regadas = set()

        self.cant_combustible = 0
        self.cant_fertilizante = 0

        self.posx_robot = posx_robot
        self.posy_robot = posy_robot
        self.cant_plantas = cant_plantas
        self.nomenc = nomenc

    def get_state(self):
        return (self.posx_robot, self.posy_robot, self.cant_combustible,
                self.cant_fertilizante, frozenset(self.plantas_regadas))

    def coger_combustible(self):
        self.cant_combustible = 30
        self.costo_paso = 0.5

    def usar_combustible(self):
        if self.cant_combustible > 0:
            self.cant_combustible -= 1
            self.costo_paso = 1 if self.cant_combustible == 0 else 0.5

    def coger_fertilizante(self):
        self.cant_fertilizante = 2

    def usar_fertilizante(self):
        if self.cant_fertilizante > 0 and (self.posx_robot, self.posy_robot) not in self.plantas_regadas:
            self.cant_fertilizante -= 1
            self.cant_plantas -= 1
            self.plantas_regadas.add((self.posx_robot, self.posy_robot))

    def get_costo(self):
        return self.costo_acum

    def get_pos_robot(self):
        return (self.posx_robot, self.posy_robot)

    def paso(self, pos_robot, casilla):
        self.costo_acum += self.costo_paso
        self.posx_robot, self.posy_robot = pos_robot

        self.usar_combustible()
        self.change_state(casilla)

    def isWin(self):
        return self.cant_plantas == 0

    def change_state(self, casilla):
        opciones = {
            self.nomenc["VACIO"]  : lambda: "",
            self.nomenc["ROBOT"]  : lambda: "",
            self.nomenc["PLANTA"] : self.usar_fertilizante,
            self.nomenc["FERTILIZANTE"] : self.coger_fertilizante,
            self.nomenc["AVION"]  : self.coger_combustible
        }

        opciones.get(casilla, lambda: "error")()

    def __eq__(self, other):
        return isinstance(other, State) and self.get_state() == other.get_state()

    def __hash__(self):
        return hash(self.get_state())

        