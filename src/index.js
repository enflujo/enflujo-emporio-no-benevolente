import './scss/estilos.scss';
console.log('..:: EnFlujo ::..');
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const contenedorMensaje = document.getElementById('mensaje');
const seccionVideo = document.getElementById('seccionVideo');
const lista = document.getElementById('listaVideos');
const video = document.getElementById('video');
const iconoFullScreen = document.getElementById('iconoFullScreen');
const lienzo = document.getElementById('lienzo');
// const lienzo2 = document.getElementById('lienzo2');
const ctx = lienzo.getContext('2d');
// const ctx2 = lienzo2.getContext('2d');
const listaCategorias = document.getElementById('listaCategorias');
// const tiemposAparicionCategorias = document.getElementById('tiemposAparicionCategorias');
// const espacioAparicionCategorias = document.getElementById('espacioAparicionCategorias');
const barraDeRangos = document.getElementById('barraDeRangos');
const valorConfianza = document.getElementById('valorConfianza');
const configuracionConfianza = document.getElementById('configuracionConfianza');
let apariciones = {};

let modelo;
let contadorAnim;

let pantallaCompleta = false;

// Video en pantalla completa
function ampliarVideo() {
  lista.classList.add('oculta');
  contenedorMensaje.classList.add('oculto');
  seccionVideo.classList.add('pantallaCompleta');
  lienzo.classList.add('pantallaCompleta');
  video.classList.add('pantallaCompleta');
  configuracionConfianza.classList.add('confianzaPantallaCompleta');
  listaCategorias.classList.add('pantallaCompleta');
  iconoFullScreen.classList.add('pantallaCompleta');
}

function reducirVideo() {
  if (pantallaCompleta === true) {
    imprimirMensaje('Model loaded, ready to play videos.');
    lista.classList.remove('oculta');
    contenedorMensaje.classList.remove('oculto');
    seccionVideo.classList.remove('pantallaCompleta');
    lienzo.classList.remove('pantallaCompleta');
    video.classList.remove('pantallaCompleta');
    configuracionConfianza.classList.remove('confianzaPantallaCompleta');
    listaCategorias.classList.remove('pantallaCompleta');
    iconoFullScreen.classList.remove('pantallaCompleta');
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
      // if (!listaCreadaCategorias.some((instancia) => instancia.categoria === categoria)) {
      //   listaCreadaCategorias.push({
      //     categoria,
      //     apariciones: [],
      //   });
      //   const elemento = document.createElement('div');
      //   elemento.className = 'categoria';
      //   elemento.innerText = categoria;
      //   listaCategorias.appendChild(elemento);
      // }

      // const objeto = listaCreadaCategorias.find((obj) => obj.categoria === categoria);
      // objeto.apariciones.push({
      //   tiempo: video.currentTime,
      //   area: prediccion.bbox,
      //   confianza: prediccion.score,
      // });

      // const elementoTiempo = document.createElement('div');
      // elementoTiempo.className = 'elementoTiempo';
      // elementoTiempo.innerText = objeto.apariciones[0].tiempo;
      // tiemposAparicionCategorias.appendChild(elementoTiempo);

      // const elementoEspacio = document.createElement('div');
      // elementoEspacio.className = 'elementoEspacio';
      // elementoEspacio.innerText = objeto.apariciones[0].area;
      // espacioAparicionCategorias.appendChild(elementoEspacio);
    });
  }

  contadorAnim = requestAnimationFrame(verVideo);
}
// function detector(prediccion, categoria) {
//   if (!apariciones.hasOwnProperty(prediccion.class)) {
//     apariciones[prediccion.class] = [];
//   }
//   apariciones[prediccion.class].push({
//     tiempo: video.currentTime,
//     area: prediccion.bbox,
//     confianza: prediccion.score,
//   });
//   const categoriasDetectadas = Object.keys(apariciones);
//   if (!listaCreadaCategorias.some((instancia) => instancia.prediccion === prediccion)) {
//     listaCreadaCategorias.push({
//       categoriasDetectadas,
//     });
//   }
//   const elemento = document.createElement('div');
//   elemento.className = 'categoria';
//   elemento.innerText = listaCreadaCategorias;
//   listaCategorias.appendChild(elemento);
//   console.log(`prediccion=`, prediccion);
// }

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
