import json
from controlador.controller import Controller

c = Controller()
print("Algoritmos:", c.listar_algoritmos())

mundo = c.cargar_mundo("modelo/tableros/lab.txt")
print("Mundo:", json.dumps(mundo, indent=2)[:400])

for alg in c.listar_algoritmos():
    print(f"\n--- {alg} ---")
    try:
        res = c.ejecutar(alg)
        print("Stats:", res["stats"])
        print("Pasos:", len(res["camino"]))
        print("Primeros 3:", res["camino"][:3])
    except Exception as e:
        print(f"ERROR: {e}")