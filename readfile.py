



def file_to_matrix(path: str):
    mat: list[list[str]] = []
    with open(path, 'r') as file: 
        for line in file.readlines():
            mat.append(line.strip().split(" "))
    return mat


if __name__ == '__main__':
    print(file_to_matrix("lab.txt"))
