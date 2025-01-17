import './scss/estilos.scss';
import { imprimirMensaje } from './componentes/mensajes';
import { controlesPantallaCompleta } from './componentes/pantallaCompleta';

import utilidadPredicciones from './componentes/predicciones';
import categoriasConColor from './componentes/categorias';
import { crearMenuVideos } from './componentes/ListaVideos';
import cargarModelo from './componentes/cargarModelo';

const video = document.getElementById('video') as HTMLVideoElement;
const lienzo = document.getElementById('lienzo1') as HTMLCanvasElement;
const ctx = lienzo.getContext('2d') as CanvasRenderingContext2D;
const lienzoEspectros = document.getElementById('lienzo2') as HTMLCanvasElement;
const ctx2 = lienzoEspectros.getContext('2d') as CanvasRenderingContext2D;
const lienzoEspectroCategoria = document.getElementById('lienzo3') as HTMLCanvasElement;

let contadorAnim: number;
let nombreVideo = '';
let escala = { x: 1, y: 1 };
const verVideo = document.getElementById('verVideo');
const verVis = document.getElementById('verVis');

const predicciones = utilidadPredicciones(lienzoEspectros, lienzoEspectroCategoria);

if (verVideo) {
  verVideo.onclick = () => {
    const activo = verVideo.classList.contains('activo');

    if (activo) {
      verVideo.classList.remove('activo');
      video.classList.remove('visible');
    } else {
      verVideo.classList.add('activo');
      video.classList.add('visible');
    }
  };
}

if (verVis) {
  verVis.onclick = () => {
    const activo = verVis.classList.contains('activo');

    if (activo) {
      verVis.classList.remove('activo');
      lienzoEspectros.classList.remove('visible');
    } else {
      verVis.classList.add('activo');
      lienzoEspectros.classList.add('visible');
    }
  };
}

function cargarVideo(nombre: string, formato: string) {
  if (!video) return;
  video.innerHTML = '';
  const fuente = document.createElement('source');
  fuente.setAttribute('src', `${import.meta.env.BASE_URL}/videos/${nombre}`);
  fuente.setAttribute('type', `video/${formato}`);
  video.appendChild(fuente);
  nombreVideo = nombre;
  video.load();
  predicciones.reiniciar();
}

async function inicio() {
  const barraConfianza = document.getElementById('barraConfianza') as HTMLInputElement;
  const valorConfianza = document.getElementById('valorConfianza') as HTMLInputElement;
  let reloj: ReturnType<typeof setTimeout> | null = null;

  imprimirMensaje('Loading model, this can take some time...');
  const modelo = await cargarModelo(+barraConfianza.value);
  imprimirMensaje('Model loaded, ready to play videos. Please select one from the list below.');
  await crearMenuVideos(cargarVideo);
  controlesPantallaCompleta();
  actualizarConfianza();

  video.onloadstart = () => {
    const nombreArchivo = video.querySelector('source')?.src.split('/').pop();
    imprimirMensaje(`Loading video: ${nombreArchivo}`);
  };

  video.onloadedmetadata = () => {
    escalar();
    imprimirMensaje('Video ready');
  };

  video.onpause = () => {
    window.cancelAnimationFrame(contadorAnim);
  };

  video.onplay = () => {
    contadorAnim = requestAnimationFrame(verVideo);
  };

  let tiempoAnterior = -1;

  async function verVideo() {
    let tiempoAhora = performance.now();
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
          /** Vista normal */
          const texto = categoria + ` - ${(score * 100) | 0}%`;
          ctx.strokeStyle = categoriasConColor[categoria];
          ctx.beginPath();
          ctx.rect(x, y, ancho, alto);
          ctx.stroke();
          ctx.save();
          ctx.fillStyle = 'black';
          ctx.fillRect(x, y, ctx.measureText(texto).width, 20);
          ctx.fillStyle = 'white';
          ctx.fillText(texto, x, y + 13);
          ctx.restore();

          /** Vista Visualización 1 */
          ctx2.save();
          ctx2.fillStyle = categoriasConColor[categoria];
          ctx2.fillRect(x, y, ancho, alto);
          ctx2.restore();

          predicciones.agregar(categoria, score, { x, y, ancho, alto }, video.currentTime);
        }
      });
    }
    contadorAnim = requestAnimationFrame(verVideo);
  }

  async function actualizarConfianza() {
    const valor = +barraConfianza.value;
    valorConfianza.innerText = `${Math.floor(valor * 100)}%`;

    if (reloj !== null) {
      clearTimeout(reloj);
    }
    reloj = setTimeout(() => {
      modelo.setOptions({ scoreThreshold: +barraConfianza.value });
      reloj = null;
    }, 500);
  }

  barraConfianza.oninput = actualizarConfianza;

  function escalar() {
    video.width = lienzo.width = lienzoEspectros.width = lienzoEspectroCategoria.width = video.clientWidth;
    video.height = lienzo.height = lienzoEspectros.height = lienzoEspectroCategoria.height = video.clientHeight;

    if (lienzo.width > video.videoWidth) escala.x = lienzo.width / video.videoWidth;
    else escala.x = video.videoWidth / lienzo.width;
    if (lienzo.height > video.videoHeight) escala.y = lienzo.height / video.videoHeight;
    else escala.y = video.videoHeight / lienzo.height;

    ctx.lineWidth = 2 * escala.x;
    ctx.strokeStyle = 'red';
    ctx2.fillStyle = '#f56468';
    ctx2.globalAlpha = 0.01;
  }
}

const botonDescarga = document.getElementById('descargar');

if (botonDescarga) {
  botonDescarga.addEventListener('click', () => {
    const enlace = document.createElement('a');
    enlace.setAttribute(
      'href',
      'data:text/plain;charset=utf-8, ' + encodeURIComponent(JSON.stringify(predicciones.apariciones()))
    );
    enlace.setAttribute('download', `apariciones-${nombreVideo}.json`);
    document.body.appendChild(enlace);
    enlace.click();
  });
}

inicio().catch(console.error);
