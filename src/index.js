import './scss/estilos.scss';
console.log('..:: EnFlujo ::..');
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const contenedorMensaje = document.getElementById('mensaje');
const lista = document.getElementById('listaVideos');
const video = document.getElementById('video');
const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');

let modelo;
let contadorAnim;

function imprimirMensaje(mensaje) {
  contenedorMensaje.innerText = mensaje;
}

function cargarVideo(nombre) {
  video.innerHTML = '';
  const fuente = document.createElement('source');
  fuente.setAttribute('src', `./videos/${nombre}`);
  fuente.setAttribute('type', 'video/webm');
  video.appendChild(fuente);
  video.load();
}

video.onloadstart = () => {
  const nombreArchivo = video.querySelector('source').src.split('/').pop();
  imprimirMensaje(`Loading video: ${nombreArchivo}`);
};

video.onloadedmetadata = () => {
  video.width = video.videoWidth;
  video.height = video.videoHeight;
  lienzo.width = video.offsetWidth;
  lienzo.height = video.offsetHeight;

  ctx.lineWidth = '2px';
  ctx.strokeStyle = 'red';
  imprimirMensaje('Video ready');
};

video.onpause = () => {
  window.cancelAnimationFrame(contadorAnim);
};

video.onplay = () => {
  contadorAnim = requestAnimationFrame(verVideo);
};

async function verVideo() {
  if (video.readyState > 1) {
    const predicciones = await modelo.detect(video);
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);

    predicciones.forEach((prediccion) => {
      if (prediccion.score > 0.6) {
        const [x, y, ancho, alto] = prediccion.bbox;
        const { class: categoria } = prediccion;

        ctx.beginPath();
        ctx.rect(x, y, ancho, alto);
        ctx.stroke();

        ctx.save();
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, ctx.measureText(categoria).width, 20);
        ctx.fillStyle = 'white';
        ctx.fillText(categoria, x, y + 13);
        ctx.restore();
      }
    });
  }

  contadorAnim = requestAnimationFrame(verVideo);
}

async function inicio() {
  const respuesta = await fetch('./listaVideos.json');
  const videos = await respuesta.json();
  console.log(videos);

  imprimirMensaje('Loading model, this can take some time...');
  modelo = await cocoSsd.load();
  imprimirMensaje('Model loaded, ready to play videos.');

  videos.forEach((nombreVideo) => {
    const btn = document.createElement('li');
    btn.classList.add('videoBtn');
    btn.innerText = nombreVideo;
    lista.appendChild(btn);

    btn.onclick = () => {
      const seleccionado = document.querySelector('.seleccionado');

      if (seleccionado) seleccionado.classList.remove('seleccionado');

      btn.classList.add('seleccionado');
      cargarVideo(nombreVideo);
    };
  });
}

inicio();
