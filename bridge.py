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


class Bridge:
    def __init__(self, controller):
        self.controller = controller

    def run(self):
        api = Api(self.controller)
        webview.create_window("AgroBot", "vista/index.html", js_api=api)
        webview.start()