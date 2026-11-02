import os

import webview


class Api:
    def __init__(self, controller):
        self._controller = controller

    def listar_algoritmos(self):
        return self._controller.listar_algoritmos()

    def cargar_mundo(self, path):
        return self._controller.cargar_mundo(path)

    def ejecutar(self, algoritmo):
        return self._controller.ejecutar(algoritmo)

    # Abre el diálogo nativo para escoger el .txt del mundo; devuelve la ruta o None si se cancela
    def elegir_archivo(self):
        rutas = webview.windows[0].create_file_dialog(
            webview.FileDialog.OPEN,
            directory=os.path.abspath("modelo/tableros"),
            file_types=("Mundos (*.txt)", "Todos los archivos (*.*)"),
        )
        return rutas[0] if rutas else None


class Bridge:
    def __init__(self, controller):
        self.controller = controller

    def run(self):
        api = Api(self.controller)
        webview.create_window("Super AgroBot", "vista/index.html", js_api=api,
                              width=1280, height=880, min_size=(960, 680))
        webview.start(gui="qt")
