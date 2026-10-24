from state import State
from tablero import Tablero
import copy

class SolverDfs:
    def __init__(self, tablero: Tablero):
        self.tablero = tablero

        self.nomenc = tablero.get_nomenc()
        posx_robot, posy_robot = tablero.get_pos_robot()
        cant_plantas = tablero.get_cant_plantas()

        self.initial_state = State(posx_robot, posy_robot, cant_plantas, self.nomenc)
        self.queue = [(self.initial_state, [self.initial_state])]
        self.visitados = set()


    def casillas_vecinas(self, estado):
        posx, posy = estado.get_pos_robot()
        casillas_vecinas = []
        movimientos = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        for dx, dy in movimientos:
            nx = posx + dx
            ny = posy + dy
            
            # Validar que no se salga de los límites del tablero (10x10)
            if 0 <= nx < 10 and 0 <= ny < 10:
                casilla = self.tablero.get_posicion(ny, nx)

                if casilla != self.nomenc["PARED"]:
                    casillas_vecinas.append((nx, ny))
                    
        return casillas_vecinas

    def run(self):
        while self.queue:
            estado_actual, camino = self.queue.pop()

            tupla_estado = estado_actual.get_state()
            if tupla_estado in self.visitados:
                continue
            self.visitados.add(tupla_estado) 

            
            if estado_actual.isWin():
                print(f"¡Solución encontrada! Costo total: {estado_actual.get_costo()}")
                return camino

            for nueva_x, nueva_y in self.casillas_vecinas(estado_actual):
            
                # 1. Clonar el estado actual
                nuevo_estado = copy.deepcopy(estado_actual)
            
                # 2. Obtener la casilla usando tu método seguro
                casilla = self.tablero.get_posicion(nueva_y, nueva_x)
                
                # 3. Aplicar el paso al nuevo estado
                nuevo_estado.paso((nueva_x, nueva_y), casilla)
                self.queue.append((nuevo_estado, camino + [nuevo_estado]))

        print("No se encontró solución.")
        return None
        
