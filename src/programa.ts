import './scss/estilos.scss';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import { load } from '@tensorflow-models/coco-ssd';
import { imprimirMensaje } from './componentes/mensajes';
import type { ObjectDetection, DetectedObject } from '@tensorflow-models/coco-ssd';
import { controlesPantallaCompleta } from './componentes/pantallaCompleta';

const lista = document.getElementById('listaVideos') as HTMLUListElement;
const video = document.getElementById('video') as HTMLVideoElement;

const lienzo = document.getElementById('lienzo') as HTMLCanvasElement;
const ctx = lienzo?.getContext('2d');
const listaCategorias = document.getElementById('listaCategorias') as HTMLDivElement;
const barraDeRangos = document.getElementById('barraDeRangos') as HTMLInputElement;
const valorConfianza = document.getElementById('valorConfianza') as HTMLInputElement;

let apariciones = {};
let modelo: ObjectDetection;
let contadorAnim: number;
let nombreVideo = '';

const actualizarConfianza = () => {
  const valor = +barraDeRangos.value;
  valorConfianza.innerText = `${Math.floor(valor * 100)}%`;
};

controlesPantallaCompleta();
actualizarConfianza();

function cargarVideo(nombre: string, formato: string) {
  if (!video) return;
  video.innerHTML = '';
  const fuente = document.createElement('source');
  fuente.setAttribute('src', `./videos/${nombre}`);
  fuente.setAttribute('type', `video/${formato}`);
  video.appendChild(fuente);
  nombreVideo = nombre;
  video.load();
}

video.onloadstart = () => {
  const nombreArchivo = video.querySelector('source')?.src.split('/').pop();
  imprimirMensaje(`Loading video: ${nombreArchivo}`);
};

video.onloadedmetadata = () => {
  video.width = lienzo.width = video.videoWidth;
  video.height = lienzo.height = video.videoHeight;
  if (!ctx) return;

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'red';
  imprimirMensaje('Video ready');
};

video.onpause = () => {
  window.cancelAnimationFrame(contadorAnim);
};

video.onplay = () => {
  contadorAnim = requestAnimationFrame(verVideo);
};

barraDeRangos.oninput = actualizarConfianza;

document.getElementById('downloadbutton')?.addEventListener(
  'click',
  () => {
    download(`apariciones-${nombreVideo}.json`, JSON.stringify(apariciones));
  },
  false
);

async function verVideo() {
  if (!ctx) return;
  if (video.readyState > 1) {
    const predicciones = await modelo.detect(video, 20, +barraDeRangos.value);
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);

    predicciones.forEach((prediccion) => {
      const [x, y, ancho, alto] = prediccion.bbox;
      const { class: categoria } = prediccion;
      const texto = categoria + ` - ${(prediccion.score * 100) | 0}%`;
      ctx.beginPath();
      ctx.rect(x, y, ancho, alto);
      ctx.stroke();
      ctx.save();
      ctx.fillStyle = 'black';
      ctx.fillRect(x, y, ctx.measureText(texto).width, 20);
      ctx.fillStyle = 'white';
      ctx.fillText(texto, x, y + 13);
      ctx.restore();
      detector(prediccion);
    });
  }

  contadorAnim = requestAnimationFrame(verVideo);
}

function detector(prediccion: DetectedObject) {
  if (!apariciones.hasOwnProperty(prediccion.class)) {
    const nombreCategoria = prediccion.class;
    apariciones[nombreCategoria] = [];
    const elemento = document.createElement('div');
    elemento.className = 'categoria';
    elemento.innerText = nombreCategoria;
    listaCategorias.appendChild(elemento);
    elemento.onclick = () => {
      console.log(`Apariciones de categoría ${prediccion.class}`, apariciones[nombreCategoria]);
    };
  }

  apariciones[prediccion.class].push({
    tiempo: video.currentTime,
    area: prediccion.bbox,
    confianza: prediccion.score,
  });
}

function download(nombre: string, datos: string) {
  const enlace = document.createElement('a');
  enlace.setAttribute('href', 'data:text/plain;charset=utf-8, ' + encodeURIComponent(datos));
  enlace.setAttribute('download', nombre);
  document.body.appendChild(enlace);
  enlace.click();
}

async function inicio() {
  const videos = await fetch('./listaVideos.json').then((res) => res.json());

  imprimirMensaje('Loading model, this can take some time...');
  modelo = await load();
  imprimirMensaje('Model loaded, ready to play videos.');

  videos.forEach(({ nombre, formato }) => {
    const btn = document.createElement('li');
    btn.classList.add('videoBtn');
    btn.innerText = nombre;
    lista.appendChild(btn);

    btn.onclick = () => {
      const seleccionado = document.querySelector('.seleccionado');
      apariciones = {};
      listaCategorias.innerHTML = '';

      if (seleccionado) seleccionado.classList.remove('seleccionado');

      btn.classList.add('seleccionado');
      cargarVideo(nombre, formato);
    };
  });
}

inicio();
