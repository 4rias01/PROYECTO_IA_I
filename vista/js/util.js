// Utilidades pequeñas compartidas por los demás módulos

export const $ = (id) => document.getElementById(id);
export const clave = ([x, y]) => `${x},${y}`;
export const coordenada = ([x, y]) => `(${y},${x})`;
export const relleno = (n, ancho) => String(n).padStart(ancho, "0");
