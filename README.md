Crear entorno virtual:

uv venv

Instalar dependencias de Python:

uv pip install -r requirements.txt

Ejecutar la aplicacion (desde la raiz del proyecto):

uv run python main.py

Notas para Linux:

- Este proyecto usa `pywebview` con backend Qt (`PyQt6` + `PyQt6-WebEngine` + `qtpy`).
- Si prefieres GTK, necesitas paquetes del sistema como `python3-gi` y WebKitGTK (`gir1.2-webkit2-4.1`) ademas de configurar pywebview para GTK.