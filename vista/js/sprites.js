// Sprites 16x16 en pixel art. Cada letra es un color de la paleta; "." es transparente.

const PALETAS = {
  mario: { R: "#d82800", S: "#fca044", B: "#7c3c00", K: "#000000", O: "#2038ec", Y: "#fcd800" },
  // paletas que se alternan mientras Mario tiene el poder del champiñón
  marioPoder1: { R: "#fcfcfc", S: "#fca044", B: "#d82800", K: "#000000", O: "#d82800", Y: "#fcd800" },
  marioPoder2: { R: "#00a800", S: "#fce0a8", B: "#000000", K: "#000000", O: "#fcd800", Y: "#fcfcfc" },
  bowser: { G: "#00a800", D: "#005800", T: "#fcd8a8", Y: "#f8b800", W: "#fcfcfc", R: "#e45c10", K: "#000000" },
  espada: { L: "#9c9c9c", W: "#fcfcfc", Y: "#fcd800", B: "#7c3c00", R: "#d82800", K: "#000000" },
  champinon: { K: "#000000", R: "#d82800", W: "#fcfcfc", C: "#fce0a8" },
};

const MATRICES = {
  marioA: [
    "................",
    "......RRRRR.....",
    ".....RRRRRRRRR..",
    ".....BBBSSKS....",
    "....BSBSSSKSSS..",
    "....BSBBSSSKSSS.",
    "....BBSSSSKKKK..",
    "......SSSSSSS...",
    ".....RROROOR....",
    "....RRRORROORR..",
    "...RRRROOOORRRR.",
    "...SSROYOOYORSS.",
    "...SSSOOOOOOSSS.",
    "...SSOOOOOOOOSS.",
    ".....OOO..OOO...",
    "....BBBB..BBBB..",
  ],
  marioB: [
    "................",
    "......RRRRR.....",
    ".....RRRRRRRRR..",
    ".....BBBSSKS....",
    "....BSBSSSKSSS..",
    "....BSBBSSSKSSS.",
    "....BBSSSSKKKK..",
    "......SSSSSSS...",
    ".....RRORRR.....",
    "....RRRORRORR...",
    "....RRROOOORSS..",
    "....SSOYOOYOSS..",
    "....SSOOOOOOO...",
    "......OOOOOO....",
    "......BBBOOO....",
    ".....BBBBBBB....",
  ],
  bowser: [
    "..W..........W..",
    "..WW.RRRRRR.WW..",
    "...WRRRRRRRRW...",
    "...GGGGGGGGGG...",
    "..GGKWGGGGWKGG..",
    "..GGKKGGGGKKGG..",
    "..GTTTTTTTTTTG..",
    "..GTKTTTTTTKTG..",
    "..GWTWTWTWTWTG..",
    "...GTTTTTTTTG...",
    ".W.DGGGGGGGGD.W.",
    "WDDDYYYYYYYYDDDW",
    ".DDYYYYYYYYYYDD.",
    ".DDDYYYYYYYYDDD.",
    "..GGG.YYYY.GGG..",
    ".WGGW......WGGW.",
  ],
  espada: [
    ".............KKK",
    "............KWLK",
    "...........KWLK.",
    "..........KWLK..",
    ".........KWLK...",
    "........KWLK....",
    ".......KWLK.....",
    "..KK..KWLK......",
    "..KYKKWLK.......",
    "...KYYLK........",
    "....KYYK........",
    "...KBKYYK.......",
    "..KBK.KKYK......",
    ".KRK....KK......",
    "KRRK............",
    ".KK.............",
  ],
  champinon: [
    "................",
    "......KKKK......",
    "....KKRRWWKK....",
    "...KRRRRWWWWK...",
    "..KWRRRRRWWWWK..",
    "..KWWRRRRRWWRK..",
    ".KWWWWRRRRRRRRK.",
    ".KWWWWRRRWWWRRK.",
    ".KRWWRRRWWWWWRK.",
    ".KRRRRRRWWWWWRK.",
    ".KRRKKKKKKKKRRK.",
    "..KKCCKCCKCCKK..",
    "...KCCKCCKCCK...",
    "...KCCCCCCCCK...",
    "....KCCCCCCK....",
    ".....KKKKKK.....",
  ],
};

// Ladrillo generado: hileras de 4px con juntas desplazadas medio ladrillo
function matrizLadrillo() {
  const filas = [];
  for (let y = 0; y < 16; y++) {
    let fila = "";
    const hilera = Math.floor(y / 4);
    for (let x = 0; x < 16; x++) {
      const junta = y % 4 === 3 || (x + (hilera % 2) * 4) % 8 === 7;
      if (junta) fila += "K";
      else if (y % 4 === 0 || (x + (hilera % 2) * 4) % 8 === 0) fila += "L";
      else fila += "M";
    }
    filas.push(fila);
  }
  return filas;
}
MATRICES.ladrillo = matrizLadrillo();
PALETAS.ladrillo = { K: "#000000", L: "#fcbcb0", M: "#c84c0c" };

// Version en grises de una paleta, para los Bowsers derrotados
function paletaGris(paleta) {
  const gris = {};
  for (const [letra, hex] of Object.entries(paleta)) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const l = Math.round((0.3 * r + 0.59 * g + 0.11 * b) * 0.7);
    gris[letra] = `rgb(${l},${l},${l})`;
  }
  return gris;
}
PALETAS.bowserDerrotado = paletaGris(PALETAS.bowser);

// Pinta una matriz en un canvas de 16x16 y lo cachea
const _cacheSprites = new Map();
export function sprite(nombreMatriz, nombrePaleta = nombreMatriz) {
  const clave = `${nombreMatriz}/${nombrePaleta}`;
  if (_cacheSprites.has(clave)) return _cacheSprites.get(clave);

  const matriz = MATRICES[nombreMatriz];
  const paleta = PALETAS[nombrePaleta];
  const lienzo = document.createElement("canvas");
  lienzo.width = 16;
  lienzo.height = 16;
  const ctx = lienzo.getContext("2d");
  matriz.forEach((fila, y) => {
    [...fila].forEach((letra, x) => {
      if (letra === "." || !paleta[letra]) return;
      ctx.fillStyle = paleta[letra];
      ctx.fillRect(x, y, 1, 1);
    });
  });
  _cacheSprites.set(clave, lienzo);
  return lienzo;
}

// Canvas suelto con un sprite ampliado, para la leyenda y el HUD
export function iconoSprite(nombreMatriz, nombrePaleta, escala = 2) {
  const lienzo = document.createElement("canvas");
  lienzo.width = 16 * escala;
  lienzo.height = 16 * escala;
  lienzo.className = "icono-sprite";
  const ctx = lienzo.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite(nombreMatriz, nombrePaleta), 0, 0, lienzo.width, lienzo.height);
  return lienzo;
}
