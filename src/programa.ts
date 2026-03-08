import './scss/estilos.scss';
import { imprimirMensaje } from './componentes/mensajes';
import { controlesPantallaCompleta } from './componentes/pantallaCompleta';

import utilidadPredicciones from './componentes/predicciones';
import categoriasConColor from './componentes/categorias';
import { crearMenuVideos } from './componentes/ListaVideos';
import cargarModelo from './componentes/cargarModelo';
import { inicializarPanel } from './componentes/panelTraducciones';
import { inicializarMapa } from './componentes/mapa';

const video = document.getElementById('video') as HTMLVideoElement;
const lienzo = document.getElementById('lienzo1') as HTMLCanvasElement;
const ctx = lienzo.getContext('2d') as CanvasRenderingContext2D;
const lienzoEspectros = document.getElementById('lienzo2') as HTMLCanvasElement;
const ctx2 = lienzoEspectros.getContext('2d') as CanvasRenderingContext2D;
const lienzoEspectroCategoria = document.getElementById('lienzo3') as HTMLCanvasElement;

let contadorAnim: number;
let escala = { x: 1, y: 1 };
const verVideoBtn = document.getElementById('verVideo');
const verVis = document.getElementById('verVis');

const predicciones = utilidadPredicciones(lienzoEspectroCategoria);

function activarModo(modo: 'archivo' | 'rastro') {
  if (modo === 'archivo') {
    video.classList.add('visible');
    lienzo.classList.add('visible');
    lienzoEspectros.classList.remove('visible');
    verVideoBtn?.classList.add('activo');
    verVis?.classList.remove('activo');
  } else {
    video.classList.remove('visible');
    lienzo.classList.remove('visible');
    lienzoEspectros.classList.add('visible');
    verVis?.classList.add('activo');
    verVideoBtn?.classList.remove('activo');
  }
}

activarModo('archivo');

if (verVideoBtn) {
  verVideoBtn.onclick = () => activarModo('archivo');
}

if (verVis) {
  verVis.onclick = () => activarModo('rastro');
}

const CONFIANZA_POR_DEFECTO = 0.2;

function textoDeteccion(categoria: string, score: number): string {
  const pct = (score * 100) | 0;
  if (score >= 0.7) {
    return `I'm fairly certain this is a ${categoria} (${pct}%)`;
  } else if (score >= 0.4) {
    return `I think I see a ${categoria} here (${pct}%)`;
  } else {
    return `I'm struggling to name this. Perhaps a ${categoria}? (${pct}%)`;
  }
}

function estilosPorConfianza(ctx: CanvasRenderingContext2D, score: number, color: string) {
  if (score >= 0.7) {
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = color;
  } else if (score >= 0.4) {
    ctx.globalAlpha = 0.75;
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
  } else {
    ctx.globalAlpha = 0.55;
    ctx.setLineDash([2, 5]);
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = color;
  }
}

async function inicio() {
  inicializarPanel({
    pausar: () => video.pause(),
    reanudar: () => video.play().catch(() => {}),
  });
  await inicializarMapa();

  imprimirMensaje('Cargando vocabulario — 80 palabras para nombrar el mundo...');
  const modelo = await cargarModelo(CONFIANZA_POR_DEFECTO);

  const { videos, marcarActivo } = await crearMenuVideos((_nombre, _formato, indice) => {
    irAVideo(indice);
  });

  controlesPantallaCompleta();

  let indiceActual = 0;

  function reiniciar() {
    predicciones.reiniciar();
    ctx2.clearRect(0, 0, lienzoEspectros.width, lienzoEspectros.height);
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
  }

  function irAVideo(indice: number) {
    indiceActual = indice;
    const { nombre, formato } = videos[indiceActual];
    marcarActivo(indiceActual);
    reiniciar();

    video.innerHTML = '';
    const fuente = document.createElement('source');
    fuente.setAttribute('src', `${import.meta.env.BASE_URL}/videos/${nombre}`);
    fuente.setAttribute('type', `video/${formato}`);
    video.appendChild(fuente);
    video.load();
  }

  function siguienteVideo() {
    irAVideo((indiceActual + 1) % videos.length);
  }

  // Arrancar con el primer video
  imprimirMensaje('La máquina está lista. Iniciando archivo...');
  irAVideo(0);

  video.onloadstart = () => {
    const nombreArchivo = video.querySelector('source')?.src.split('/').pop();
    imprimirMensaje(`Cargando archivo: ${nombreArchivo}`);
  };

  video.onloadedmetadata = () => {
    escalar();
    imprimirMensaje('Observando...');
    video.play().catch(() => {
      imprimirMensaje('Presione play para comenzar.');
    });
  };

  video.onended = () => {
    siguienteVideo();
  };

  video.onpause = () => {
    window.cancelAnimationFrame(contadorAnim);
  };

  video.onplay = () => {
    contadorAnim = requestAnimationFrame(observar);
  };

  let tiempoAnterior = -1;

  function observar() {
    const tiempoAhora = performance.now();
    if (video.currentTime !== tiempoAnterior) {
      tiempoAnterior = video.currentTime;
      const { detections } = modelo.detectForVideo(video, tiempoAhora);
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);

      detections.forEach((prediccion) => {
        if (prediccion.boundingBox) {
          const { originX: x0, originY: y0, width: ancho0, height: alto0 } = prediccion.boundingBox;
          const { categoryName: categoria, score } = prediccion.categories[0];

          const x = x0 * escala.x;
          const y = y0 * escala.y;
          const ancho = ancho0 * escala.x;
          const alto = alto0 * escala.y;

          const texto = textoDeteccion(categoria, score);
          const color = categoriasConColor[categoria];
          ctx.save();
          estilosPorConfianza(ctx, score, color);
          ctx.beginPath();
          ctx.rect(x, y, ancho, alto);
          ctx.stroke();
          const anchoTexto = ctx.measureText(texto).width + 6;
          const textoX = x + anchoTexto > lienzo.width ? lienzo.width - anchoTexto - 2 : x;
          const textoY = y < 20 ? y + alto + 18 : y;
          ctx.fillStyle = 'rgba(0,0,0,0.8)';
          ctx.fillRect(textoX, textoY - 18, anchoTexto, 17);
          ctx.fillStyle = score >= 0.4 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)';
          ctx.fillText(texto, textoX + 3, textoY - 5);
          ctx.restore();

          /** Rastro acumulado */
          ctx2.save();
          ctx2.globalAlpha = score >= 0.7 ? 0.025 : score >= 0.4 ? 0.015 : 0.006;
          ctx2.fillStyle = color;
          ctx2.fillRect(x, y, ancho, alto);
          ctx2.restore();

          predicciones.agregar(categoria, score, { x, y, ancho, alto }, video.currentTime);
        }
      });
    }
    contadorAnim = requestAnimationFrame(observar);
  }

  function escalar() {
    video.width = lienzo.width = lienzoEspectros.width = lienzoEspectroCategoria.width = video.clientWidth;
    video.height = lienzo.height = lienzoEspectros.height = lienzoEspectroCategoria.height = video.clientHeight;

    escala.x = lienzo.width / video.videoWidth;
    escala.y = lienzo.height / video.videoHeight;

    ctx.font = '11px monospace';
  }
}

inicio().catch(console.error);
