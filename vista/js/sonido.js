// Efectos de sonido chiptune generados con WebAudio (ondas cuadradas, sin archivos)

const Sonido = {
  activo: true,
  _ctx: null,

  _contexto() {
    if (!this._ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this._ctx = new Ctx();
    }
    if (this._ctx.state === "suspended") this._ctx.resume();
    return this._ctx;
  },

  // notas: lista de [frecuenciaHz, duracionSeg]
  _melodia(notas, tipo = "square", volumen = 0.08) {
    if (!this.activo) return;
    const ctx = this._contexto();
    if (!ctx) return;
    let t = ctx.currentTime;
    for (const [frecuencia, duracion] of notas) {
      if (frecuencia > 0) {
        const osc = ctx.createOscillator();
        const gan = ctx.createGain();
        osc.type = tipo;
        osc.frequency.setValueAtTime(frecuencia, t);
        gan.gain.setValueAtTime(volumen, t);
        gan.gain.exponentialRampToValueAtTime(0.001, t + duracion);
        osc.connect(gan).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + duracion);
      }
      t += duracion;
    }
  },

  espada() { this._melodia([[988, 0.07], [1319, 0.22]]); },
  champinon() {
    this._melodia([[523, 0.05], [659, 0.05], [784, 0.05], [1047, 0.05], [784, 0.05], [1047, 0.05], [1319, 0.12]]);
  },
  bowser() { this._melodia([[220, 0.05], [165, 0.05], [110, 0.12]], "square", 0.1); },
  sinCombustible() { this._melodia([[392, 0.08], [330, 0.08], [262, 0.14]], "triangle", 0.12); },
  victoria() {
    this._melodia([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.25], [0, 0.06], [784, 0.1], [1047, 0.4]]);
  },
  derrota() { this._melodia([[494, 0.15], [466, 0.15], [440, 0.15], [415, 0.4]], "triangle", 0.12); },
  inicio() { this._melodia([[523, 0.08], [659, 0.08], [784, 0.08], [659, 0.08], [784, 0.2]]); },
};
