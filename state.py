from readfile import Readfile
# initial_state[pos_robot][combustible][fertilizante][plantas_regadas]
# matrix[n][m][30][2][plantas]

# hay un prolema, y es que si pasa por una planta que ya fue regada
class State:
    def __init__(self, posx_robot, posy_robot, total_plantas):
        self.costo_paso = 1
        self.costo_acum = 0
        self.plantas_regadas = set()

        self.cant_combustible = 0
        self.cant_fertilizante = 0

        self.posx_robot = posx_robot
        self.posy_robot = posy_robot
        self.total_plantas = total_plantas

        self.busqueda_informada = False
        self.plantas_sin_regar = []
        self.pos_avion = []
        self.pos_fertilizante = []

    def inicializar_busqueda_informada(self, plantas, avion, fertilizante):
        self.busqueda_informada = True
        self.plantas_sin_regar = list(plantas)
        self.pos_avion = avion
        self.pos_fertilizante = fertilizante

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
        x, y = self.posx_robot, self.posy_robot
        
        if self.cant_fertilizante > 0 and (x, y) not in self.plantas_regadas:
            self.cant_fertilizante -= 1
            self.plantas_regadas.add((x, y))
            if self.busqueda_informada:
                self.plantas_sin_regar.remove((x,y))


    def paso(self, pos_robot, casilla):
        self.costo_acum += self.costo_paso
        self.posx_robot, self.posy_robot = pos_robot

        self.usar_combustible()
        self.change_state(casilla)

    def isWin(self):
        return len(self.plantas_regadas) == self.total_plantas

    def change_state(self, casilla):
        nomenc = Readfile().get_nomenc()
        opciones = {
            nomenc["VACIO"]  : lambda: "",
            nomenc["ROBOT"]  : lambda: "",
            nomenc["PLANTA"] : self.usar_fertilizante,
            nomenc["FERTILIZANTE"] : self.coger_fertilizante,
            nomenc["AVION"]  : self.coger_combustible
        }

        opciones.get(casilla, lambda: "error")()

    def get_plantas_regadas(self):
        return self.plantas_regadas

    def get_plantas_sin_regar(self):
        return self.plantas_sin_regar
    
    def get_costo(self):
        return self.costo_acum

    def get_pos_robot(self):
        return (self.posx_robot, self.posy_robot)

    def get_pos_fertilizante(self):
        return self.pos_fertilizante

    def get_cant_fertilizante(self):
        return self.cant_fertilizante

    def __eq__(self, other):
        return isinstance(other, State) and self.get_state() == other.get_state()

    def __hash__(self):
        return hash(self.get_state())

        