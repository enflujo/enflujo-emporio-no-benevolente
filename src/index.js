import './scss/estilos.scss';
console.log('..:: EnFlujo ::..');
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { div } from '@tensorflow/tfjs';

const contenedorMensaje = document.getElementById('mensaje');
const lista = document.getElementById('listaVideos');
const video = document.getElementById('video');
const lienzo = document.getElementById('lienzo');
const lienzo2 = document.getElementById('lienzo2');
const ctx = lienzo.getContext('2d');
const ctx2 = lienzo2.getContext('2d');
const listaCategorias = document.getElementById('listaCategorias');
const tiemposAparicionCategorias = document.getElementById('tiemposAparicionCategorias');
const espacioAparicionCategorias = document.getElementById('espacioAparicionCategorias');
const BarraDeRangos = document.getElementById('BarraDeRangos');
const apariciones = {};

let modelo;
let contadorAnim;

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

let listaCreadaCategorias = [];

BarraDeRangos.oninput = function () {
  return this.value;
};

async function verVideo() {
  if (video.readyState > 1) {
    const predicciones = await modelo.detect(video, 20, BarraDeRangos.value);
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);

    predicciones.forEach((prediccion) => {
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

      if (seleccionado) seleccionado.classList.remove('seleccionado');

      btn.classList.add('seleccionado');
      cargarVideo(nombre, formato);
    };
  });
}

inicio();
