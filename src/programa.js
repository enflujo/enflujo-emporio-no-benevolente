import './scss/estilos.scss';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const contenedorMensaje = document.getElementById('mensaje');
const seccionVideo = document.getElementById('seccionVideo');
const controles = document.getElementById('controles');
const lista = document.getElementById('listaVideos');
const video = document.getElementById('video');
const iconoFullScreen = document.getElementById('iconoFullScreen');
const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
const listaCategorias = document.getElementById('listaCategorias');
const barraDeRangos = document.getElementById('barraDeRangos');
const valorConfianza = document.getElementById('valorConfianza');
const configuracionConfianza = document.getElementById('configuracionConfianza');
const confianzaInfo = document.getElementById('confianzaInfo');
let apariciones = {};
let modelo;
let contadorAnim;
let pantallaCompleta = false;

// Video en pantalla completa
function ampliarVideo() {
  controles.classList.add('oculto');
  seccionVideo.classList.add('pantallaCompleta');
  lienzo.classList.add('pantallaCompleta');
  video.classList.add('pantallaCompleta');
  configuracionConfianza.classList.add('confianzaPantallaCompleta');
  confianzaInfo.classList.add('pantallaCompleta');
  listaCategorias.classList.add('pantallaCompleta');
  iconoFullScreen.classList.add('pantallaCompleta');
  iconoFullScreen.innerText = 'Exit full screen';
}

function reducirVideo() {
  if (pantallaCompleta === true) {
    imprimirMensaje('Model loaded, ready to play videos.');
    controles.classList.remove('oculto');
    seccionVideo.classList.remove('pantallaCompleta');
    lienzo.classList.remove('pantallaCompleta');
    video.classList.remove('pantallaCompleta');
    configuracionConfianza.classList.remove('confianzaPantallaCompleta');
    confianzaInfo.classList.remove('pantallaCompleta');
    listaCategorias.classList.remove('pantallaCompleta');
    iconoFullScreen.classList.remove('pantallaCompleta');
    iconoFullScreen.innerText = 'Full screen';
  }
}

function cambiarModoPantalla() {
  if (pantallaCompleta === false) {
    ampliarVideo();
  } else {
    reducirVideo();
  }
  pantallaCompleta = !pantallaCompleta;
}

iconoFullScreen.addEventListener('click', cambiarModoPantalla);

function imprimirMensaje(mensaje) {
  contenedorMensaje.innerText = mensaje;
}

function cargarVideo(nombre, formato) {
  video.innerHTML = '';
  const fuente = document.createElement('source');
  fuente.setAttribute('src', `./videos/${nombre}`);
  fuente.setAttribute('type', `video/${formato}`);
  video.appendChild(fuente);
  video.load();
}

video.onloadstart = () => {
  const nombreArchivo = video.querySelector('source').src.split('/').pop();
  imprimirMensaje(`Loading video: ${nombreArchivo}`);
};

video.onloadedmetadata = () => {
  video.width = lienzo.width = video.videoWidth;
  video.height = lienzo.height = video.videoHeight;

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

const actualizarConfianza = () => {
  const valor = barraDeRangos.value;
  valorConfianza.innerText = `${Math.floor(valor * 100)}%`;
};

barraDeRangos.oninput = actualizarConfianza;
actualizarConfianza();

document.getElementById('downloadbutton').addEventListener(
  'click',
  function () {
    var text = JSON.stringify(apariciones);
    var filename = 'output.json';
    download(filename, text);
  },
  false
);

async function verVideo() {
  if (video.readyState > 1) {
    const predicciones = await modelo.detect(video, 20, barraDeRangos.value);
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

function detector(prediccion) {
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

function download(filename, textInput) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8, ' + encodeURIComponent(textInput));
  element.setAttribute('download', filename);
  document.body.appendChild(element);
  element.click();
}

async function inicio() {
  const respuesta = await fetch('./listaVideos.json');
  const videos = await respuesta.json();

  imprimirMensaje('Loading model, this can take some time...');
  modelo = await cocoSsd.load();
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
