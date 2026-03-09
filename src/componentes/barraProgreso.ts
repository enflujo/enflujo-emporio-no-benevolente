const ALTO_BARRA = 22;
const RESOLUCION_SEGUNDOS = 0.1;

export function crearBarraProgreso(video: HTMLVideoElement) {
  const escena = document.getElementById('escenaVideo') as HTMLDivElement;

  const canvas = document.createElement('canvas');
  canvas.id = 'canvasBarra';
  escena.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;

  // tiempo (redondeado a 0.1s) -> color hex
  const coloresPorTiempo = new Map<number, string>();

  let duracion = 0;

  function clave(t: number) {
    return Math.round(t / RESOLUCION_SEGUNDOS) * RESOLUCION_SEGUNDOS;
  }

  function tiempoAPixel(t: number) {
    if (!duracion) return 0;
    return (t / duracion) * canvas.width;
  }

  function redibujar() {
    if (!canvas.width || !duracion) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo base
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Segmentos de color por categoría
    const totalBuckets = Math.ceil(duracion / RESOLUCION_SEGUNDOS);
    for (let i = 0; i < totalBuckets; i++) {
      const t = Math.round(i * RESOLUCION_SEGUNDOS * 10) / 10;
      const color = coloresPorTiempo.get(t);
      if (!color) continue;
      const x = tiempoAPixel(t);
      const xSig = tiempoAPixel(t + RESOLUCION_SEGUNDOS);
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), 0, Math.max(1, Math.ceil(xSig - x)), canvas.height);
    }

    // Playhead
    const xHead = tiempoAPixel(video.currentTime);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(Math.floor(xHead) - 1, 0, 3, canvas.height);
  }

  function redimensionar() {
    canvas.width = escena.clientWidth;
    canvas.height = ALTO_BARRA;
    redibujar();
  }

  canvas.addEventListener('click', (e) => {
    if (!duracion) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    video.currentTime = (x / canvas.width) * duracion;
  });

  video.addEventListener('loadedmetadata', () => {
    duracion = video.duration;
    redibujar();
  });

  video.addEventListener('timeupdate', redibujar);

  window.addEventListener('resize', redimensionar);

  redimensionar();

  return {
    registrar(tiempo: number, color: string) {
      coloresPorTiempo.set(clave(tiempo), color);
    },
    reiniciar() {
      coloresPorTiempo.clear();
      duracion = 0;
      if (canvas.width) ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
