class Readfile:
    def __init__(self):
        pass

    def read_nomenc(self, path: str):
        dictionary = dict()
        with open(path, 'r', encoding='utf-8') as file:
            for line in file.readlines():
                line = line.strip()
                if not line:          # salta líneas vacías (como la 7 de tu archivo)
                    continue
                value, key = line.split('=', 1)
                dictionary[key.strip()] = value.strip()
        return dictionary

    def file_to_matrix(self, path: str):
        mat: list[list[str]] = []
        with open(path, 'r') as file: 
            for line in file.readlines():
                mat.append(line.strip().split(" "))
        return mat
