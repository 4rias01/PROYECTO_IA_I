def read_nomenc(path: str):
        dictionary = dict()
        with open(path, 'r', encoding='utf-8') as file:
            for line in file.readlines():
                line = line.strip()
                if not line:          # salta líneas vacías (como la 7 de tu archivo)
                    continue
                value, key = line.split('=', 1)
                dictionary[key.strip()] = value.strip()
        return dictionary

class Readfile:
    # atributo de clase; solo se lee una vez. Si crean o usan algun metodo de la clase y ya se leyó la nomenclatura simplemente se devuelve.
    _nomenc = None

    def __init__(self):
        if Readfile._nomenc is None:
            Readfile._nomenc = read_nomenc("tableros/nomenc.txt")
        self.nomenc = Readfile._nomenc

    def file_to_matrix(self, path: str):
        mat: list[list[str]] = []
        with open(path, 'r') as file: 
            for line in file.readlines():
                mat.append(line.strip().split(" "))
        return mat

    def get_nomenc(self):
        return self.nomenc
