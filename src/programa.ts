import './scss/estilos.scss';
import { imprimirMensaje } from './componentes/mensajes';
import { controlesPantallaCompleta } from './componentes/pantallaCompleta';

import utilidadPredicciones from './componentes/predicciones';
import categoriasConColor from './componentes/categorias';
import { crearMenuVideos } from './componentes/ListaVideos';
import cargarModelo from './componentes/cargarModelo';
import { inicializarPanel, mostrarTraducciones } from './componentes/panelTraducciones';
import { mostrarPanelCreditos, ocultarPanelCreditos, actualizarIdiomaPanelCreditos } from './componentes/panelCreditos';
import { inicializarMapa } from './componentes/mapa';
import { crearBarraProgreso } from './componentes/barraProgreso';
import { t, onCambioIdioma, aplicarTraduccionesDOM, getIdioma } from './utilidades/idioma';
import { crearSelectorIdioma } from './componentes/selectorIdioma';
import type { ClaveUI } from './datos/ui';
import { logosInstituciones, obtenerContenidoCuratorial } from './datos/creditos';

const video = document.getElementById('video') as HTMLVideoElement;
const lienzo = document.getElementById('lienzo1') as HTMLCanvasElement;
const ctx = lienzo.getContext('2d') as CanvasRenderingContext2D;
const lienzoEspectros = document.getElementById('lienzo2') as HTMLCanvasElement;
const ctx2 = lienzoEspectros.getContext('2d') as CanvasRenderingContext2D;

let contadorAnim: number;
let escala = { x: 1, y: 1 };
const verVideoBtn = document.getElementById('verVideo');
const verVis = document.getElementById('verVis');
const fraseBajaEl = document.getElementById('fraseBaja') as HTMLParagraphElement;
const fraseMediaEl = document.getElementById('fraseMedia') as HTMLParagraphElement;
const fraseAltaEl = document.getElementById('fraseAlta') as HTMLParagraphElement;
const leyendaConfianzaEl = document.getElementById('leyendaConfianza') as HTMLDivElement;
const escenaVideoEl = document.getElementById('escenaVideo') as HTMLDivElement;
const botonCreditosEl = document.getElementById('btnCreditos') as HTMLButtonElement | null;

let terminoBajaActual: string | null = null;
let terminoMediaActual: string | null = null;
let terminoAltaActual: string | null = null;
const ES_MODO_CREDITOS =
  new URLSearchParams(window.location.search).get('modo') === 'creditos' ||
  new URLSearchParams(window.location.search).get('creditos') === '1';
const TIEMPO_RETORNO_CREDITOS_MS = 60 * 1000;
let creditosActivos = false;
let temporizadorInactividadCreditos: ReturnType<typeof setTimeout> | null = null;
let listenersInactividadRegistrados = false;
let reanudarTrasCreditos = false;
let restaurarPanelPrincipal: () => void = () => {
  mostrarTraducciones('person', categoriasConColor.person);
};
const logoPorPerfil: Record<string, string> = {
  anna: 'paris8',
  alexander: 'erg',
  hugo: 'duke',
  'juan-camilo': 'enflujo-andes',
};

// Género gramatical en español para artículo "un/una"
const categoriasFemeninas = new Set([
  'person',
  'bicycle',
  'motorcycle',
  'stop sign',
  'sheep',
  'cow',
  'zebra',
  'giraffe',
  'backpack',
  'tie',
  'suitcase',
  'kite',
  'surfboard',
  'tennis racket',
  'bottle',
  'wine glass',
  'cup',
  'spoon',
  'apple',
  'orange',
  'carrot',
  'pizza',
  'donut',
  'chair',
  'potted plant',
  'bed',
  'dining table',
  'toaster',
  'scissors',
]);
function getArticuloES(categoria: string): string {
  return categoriasFemeninas.has(categoria) ? 'una' : 'un';
}

const TIEMPO_REPOSO_MS = 2500;
type ClaveTimer = 'baja' | 'media' | 'alta';
const clavesPresente: Record<ClaveTimer, ClaveUI> = { baja: 'frasesBaja', media: 'frasesMedia', alta: 'frasesAlta' };
const clavesPasada: Record<ClaveTimer, ClaveUI> = {
  baja: 'frasesBajaPasada',
  media: 'frasesMediaPasada',
  alta: 'frasesAltaPasada',
};
const timersFrases: Record<ClaveTimer, ReturnType<typeof setTimeout> | null> = { baja: null, media: null, alta: null };
const termsPreviosFrases: Record<ClaveTimer, string | null> = { baja: null, media: null, alta: null };
const estadoFrases: Record<ClaveTimer, 'activa' | 'reposo'> = { baja: 'reposo', media: 'reposo', alta: 'reposo' };

function limpiarTimersFrases() {
  (['baja', 'media', 'alta'] as ClaveTimer[]).forEach((clave) => {
    if (timersFrases[clave] !== null) {
      clearTimeout(timersFrases[clave]!);
      timersFrases[clave] = null;
    }
  });
}

function pulsarFrase(el: HTMLParagraphElement, clave: ClaveTimer, termActual: string) {
  if (creditosActivos) return;
  if (timersFrases[clave] !== null) clearTimeout(timersFrases[clave]!);

  estadoFrases[clave] = 'activa';
  el.classList.add('activa');

  timersFrases[clave] = setTimeout(() => {
    estadoFrases[clave] = 'reposo';
    el.classList.remove('activa');
    timersFrases[clave] = null;
    renderizarFrasesConfianza(); // re-render en pasado al desvanecerse
  }, TIEMPO_REPOSO_MS);

  // Flash de fondo solo cuando cambia el término detectado
  if (termActual !== termsPreviosFrases[clave]) {
    termsPreviosFrases[clave] = termActual;
    el.classList.remove('nueva-deteccion');
    void el.offsetWidth; // reiniciar animación CSS
    el.classList.add('nueva-deteccion');
  }
}

const predicciones = utilidadPredicciones();

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

function acumularPuntaje(acumulado: { [categoria: string]: number }, categoria: string, score: number) {
  acumulado[categoria] = (acumulado[categoria] || 0) + score;
}

function categoriaDominante(acumulado: { [categoria: string]: number }): string | null {
  const entradas = Object.entries(acumulado);
  if (entradas.length === 0) return null;

  let dominante: string | null = null;
  let puntajeDominante = 0;

  entradas.forEach(([categoria, puntaje]) => {
    if (puntaje > puntajeDominante) {
      dominante = categoria;
      puntajeDominante = puntaje;
    }
  });

  return dominante;
}

function renderizarFrase(el: HTMLParagraphElement, clave: ClaveTimer, term: string | null) {
  const enReposo = estadoFrases[clave] === 'reposo' && term !== null;
  const plantilla = enReposo ? t(clavesPasada[clave]) : t(clavesPresente[clave]);
  const termDisplay = term ?? '...';
  const articulo = getArticuloES(termDisplay);
  const textoCompuesto = plantilla.replace('{articulo}', articulo);
  const [antes = '', despues = ''] = textoCompuesto.split('{term}');

  el.innerHTML = '';
  const base = document.createElement('span');
  base.className = 'textoBase';
  base.textContent = antes.trim();

  const contenedorDestacado = document.createElement('span');
  contenedorDestacado.className = 'terminoDestacado';

  const abre = document.createTextNode('«');
  const palabra = document.createElement('span');
  palabra.textContent = termDisplay;

  if (clave === 'alta' && term !== null) {
    const color = categoriasConColor[term];
    if (color) palabra.style.color = color;
  }

  const cierre = document.createTextNode(`»${despues}`);

  contenedorDestacado.appendChild(abre);
  contenedorDestacado.appendChild(palabra);
  contenedorDestacado.appendChild(cierre);

  el.appendChild(base);
  el.appendChild(contenedorDestacado);
}

function renderizarFrasesConfianza() {
  if (creditosActivos) {
    renderizarCabeceraCreditos();
    return;
  }
  renderizarFrase(fraseBajaEl, 'baja', terminoBajaActual);
  renderizarFrase(fraseMediaEl, 'media', terminoMediaActual);
  renderizarFrase(fraseAltaEl, 'alta', terminoAltaActual);
}

function renderizarCabeceraCreditos() {
  fraseBajaEl.textContent = 'Verdad de referencia';
  fraseMediaEl.textContent = 'AIAIAIAIAIAIAIAIAI';
  fraseAltaEl.textContent = '';

  fraseBajaEl.classList.add('activa');
  fraseMediaEl.classList.add('activa');
  fraseAltaEl.classList.remove('activa');
  fraseBajaEl.classList.remove('nueva-deteccion');
  fraseMediaEl.classList.remove('nueva-deteccion');
  fraseAltaEl.classList.remove('nueva-deteccion');

  leyendaConfianzaEl.style.display = 'none';
}

function renderizarTextoCuratorial() {
  const previo = document.getElementById('textoCuratorial');
  if (previo) previo.remove();

  const texto = document.createElement('section');
  texto.id = 'textoCuratorial';
  const contenido = obtenerContenidoCuratorial(getIdioma());

  const titulo = document.createElement('h2');
  titulo.textContent = contenido.tituloSeccion;
  texto.appendChild(titulo);

  contenido.parrafos.forEach((parrafoTexto) => {
    const parrafo = document.createElement('p');
    parrafo.textContent = parrafoTexto;
    texto.appendChild(parrafo);
  });

  const franjaLogos = document.createElement('div');
  franjaLogos.id = 'logosInstituciones';

  const base = import.meta.env.BASE_URL || '/';
  const baseConSlash = base.endsWith('/') ? base : `${base}/`;

  logosInstituciones.forEach((logo) => {
    const figura = document.createElement('figure');
    figura.className = 'logoInstitucion';
    const claveLogo = logo.archivo.replace(/\.[^/.]+$/, '').replace(/_/g, '-');
    figura.classList.add(`logo--${claveLogo}`);

    const imagen = document.createElement('img');
    imagen.src = `${baseConSlash}logos/${logo.archivo}`;
    imagen.alt = logo.nombre;
    imagen.loading = 'lazy';
    imagen.decoding = 'async';

    figura.appendChild(imagen);
    franjaLogos.appendChild(figura);
  });

  texto.appendChild(franjaLogos);

  escenaVideoEl.appendChild(texto);
}

function actualizarLogoActivoCreditos(perfilId: string | null) {
  const logos = document.querySelectorAll<HTMLElement>('#logosInstituciones .logoInstitucion');
  if (!logos.length) return;
  const logoActivo = perfilId ? logoPorPerfil[perfilId] : null;

  logos.forEach((logo) => {
    const clases = Array.from(logo.classList);
    const claseLogo = clases.find((clase) => clase.startsWith('logo--')) || '';
    const clave = claseLogo.replace('logo--', '');
    logo.classList.toggle('activa', Boolean(logoActivo && clave === logoActivo));
  });
}

function actualizarFranjaConfianza(baja: string | null, media: string | null, alta: string | null) {
  terminoBajaActual = baja;
  terminoMediaActual = media;
  terminoAltaActual = alta;
  if (creditosActivos) return;
  renderizarFrasesConfianza();
}

function actualizarBotonCreditos() {
  if (!botonCreditosEl) return;
  botonCreditosEl.textContent = creditosActivos ? 'Volver' : 'Créditos';
  botonCreditosEl.classList.toggle('activo', creditosActivos);
}

function limpiarTemporizadorInactividadCreditos() {
  if (temporizadorInactividadCreditos) {
    clearTimeout(temporizadorInactividadCreditos);
    temporizadorInactividadCreditos = null;
  }
}

function reiniciarTemporizadorInactividadCreditos() {
  if (!creditosActivos) return;
  limpiarTemporizadorInactividadCreditos();
  temporizadorInactividadCreditos = setTimeout(() => {
    cerrarCreditos();
  }, TIEMPO_RETORNO_CREDITOS_MS);
}

function registrarListenersInactividadCreditos() {
  if (listenersInactividadRegistrados) return;
  listenersInactividadRegistrados = true;
  const reiniciarTemporizador = () => {
    reiniciarTemporizadorInactividadCreditos();
  };
  ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'].forEach((evento) => {
    document.addEventListener(evento, reiniciarTemporizador);
  });
}

function abrirCreditos() {
  if (creditosActivos) return;
  creditosActivos = true;
  limpiarTimersFrases();
  reanudarTrasCreditos = !video.paused;
  if (reanudarTrasCreditos) video.pause();

  document.body.classList.add('modo-creditos');
  renderizarCabeceraCreditos();
  renderizarTextoCuratorial();
  actualizarLogoActivoCreditos(null);
  mostrarPanelCreditos();
  actualizarBotonCreditos();

  registrarListenersInactividadCreditos();
  reiniciarTemporizadorInactividadCreditos();
}

function cerrarCreditos() {
  if (!creditosActivos) return;
  creditosActivos = false;
  limpiarTemporizadorInactividadCreditos();
  document.body.classList.remove('modo-creditos');
  const textoCuratorial = document.getElementById('textoCuratorial');
  if (textoCuratorial) textoCuratorial.remove();
  ocultarPanelCreditos();
  restaurarPanelPrincipal();
  fraseBajaEl.classList.remove('activa', 'nueva-deteccion');
  fraseMediaEl.classList.remove('activa', 'nueva-deteccion');
  fraseAltaEl.classList.remove('activa', 'nueva-deteccion');
  leyendaConfianzaEl.style.display = 'grid';
  renderizarFrasesConfianza();
  actualizarBotonCreditos();

  if (reanudarTrasCreditos) {
    video.play().catch(() => {});
  }
  reanudarTrasCreditos = false;
}

document.addEventListener('creditos:perfil-activo', (evento) => {
  const custom = evento as CustomEvent<{ id?: string }>;
  actualizarLogoActivoCreditos(custom.detail?.id ?? null);
});

if (botonCreditosEl) {
  botonCreditosEl.addEventListener('click', () => {
    if (creditosActivos) cerrarCreditos();
    else abrirCreditos();
  });
}

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && creditosActivos) cerrarCreditos();
});

onCambioIdioma(() => {
  aplicarTraduccionesDOM();
  if (ES_MODO_CREDITOS || creditosActivos) {
    renderizarCabeceraCreditos();
    renderizarTextoCuratorial();
    actualizarIdiomaPanelCreditos();
    return;
  }
  renderizarFrasesConfianza();
});

function textoDeteccion(categoria: string, score: number): string {
  const pct = (score * 100) | 0;
  const claveTexto = score >= 0.7 ? 'frasesAlta' : score >= 0.4 ? 'frasesMedia' : 'frasesBaja';
  const articulo = getArticuloES(categoria);
  return t(claveTexto).replace('{articulo}', articulo).replace('{term}', `«${categoria}» (${pct}%)`);
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
  // Inicializar i18n
  crearSelectorIdioma();
  aplicarTraduccionesDOM();
  if (ES_MODO_CREDITOS) {
    renderizarCabeceraCreditos();
  } else {
    renderizarFrasesConfianza();
  }
  actualizarBotonCreditos();

  inicializarPanel();
  await inicializarMapa();

  mostrarTraducciones('person', categoriasConColor.person);

  imprimirMensaje(t('cargandoVocabulario'));
  const modelo = await cargarModelo(CONFIANZA_POR_DEFECTO);

  const barra = crearBarraProgreso(video);

  const { videos, marcarActivo } = await crearMenuVideos((_nombre, _formato, indice) => {
    irAVideo(indice);
  });

  controlesPantallaCompleta();

  // Click en el video: alternar play/pausa
  video.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  });

  let indiceActual = 0;
  let categoriaPanelActual: string | null = 'person';
  let terminoBajaActivo: string | null = null;
  let terminoMediaActivo: string | null = null;
  let terminoAltaActiva: string | null = 'person';

  function actualizarPanelDesdeAltaConfianza(categoria: string | null) {
    if (creditosActivos) return;
    if (!categoria || categoria === categoriaPanelActual) return;

    const color = categoriasConColor[categoria];
    if (!color) return;

    categoriaPanelActual = categoria;
    mostrarTraducciones(categoria, color);
  }

  function reiniciar() {
    predicciones.reiniciar();
    barra.reiniciar();
    ctx2.clearRect(0, 0, lienzoEspectros.width, lienzoEspectros.height);
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    terminoBajaActivo = null;
    terminoMediaActivo = null;
    terminoAltaActiva = categoriaPanelActual;

    // Resetear estado visual de las frases
    (['baja', 'media', 'alta'] as ClaveTimer[]).forEach((clave) => {
      termsPreviosFrases[clave] = null;
      estadoFrases[clave] = 'reposo';
    });
    limpiarTimersFrases();
    fraseBajaEl.classList.remove('activa', 'nueva-deteccion');
    fraseMediaEl.classList.remove('activa', 'nueva-deteccion');
    fraseAltaEl.classList.remove('activa', 'nueva-deteccion');

    actualizarFranjaConfianza(terminoBajaActivo, terminoMediaActivo, terminoAltaActiva);
    restaurarPanelPrincipal = () => {
      const categoriaRestaurada = categoriaPanelActual ?? terminoAltaActiva ?? 'person';
      const colorRestaurado = categoriasConColor[categoriaRestaurada] || categoriasConColor.person;
      mostrarTraducciones(categoriaRestaurada, colorRestaurado);
    };
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
  imprimirMensaje(t('maquinaLista'));
  irAVideo(0);
  if (ES_MODO_CREDITOS) abrirCreditos();

  video.onloadstart = () => {
    const nombreArchivo = video.querySelector('source')?.src.split('/').pop() ?? '';
    imprimirMensaje(t('cargandoArchivo', { nombre: nombreArchivo }));
  };

  video.onloadedmetadata = () => {
    escalar();
    imprimirMensaje(t('observando'));
    video.play().catch(() => {
      imprimirMensaje(t('presionarPlay'));
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
      const puntajesBaja: { [categoria: string]: number } = {};
      const puntajesMedia: { [categoria: string]: number } = {};
      let categoriaAltaFrame: string | null = null;
      let scoreAltaFrame = 0;

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
          if (score >= 0.7) {
            if (score > scoreAltaFrame) {
              scoreAltaFrame = score;
              categoriaAltaFrame = categoria;
            }
          } else if (score >= 0.4) {
            acumularPuntaje(puntajesMedia, categoria, score);
          } else {
            acumularPuntaje(puntajesBaja, categoria, score);
          }
        }
      });

      const dominanteBaja = categoriaDominante(puntajesBaja);
      const dominanteMedia = categoriaDominante(puntajesMedia);

      if (dominanteBaja) {
        terminoBajaActivo = dominanteBaja;
        pulsarFrase(fraseBajaEl, 'baja', dominanteBaja);
      }
      if (dominanteMedia) {
        terminoMediaActivo = dominanteMedia;
        pulsarFrase(fraseMediaEl, 'media', dominanteMedia);
      }
      if (categoriaAltaFrame) {
        terminoAltaActiva = categoriaAltaFrame;
        pulsarFrase(fraseAltaEl, 'alta', categoriaAltaFrame);
        actualizarPanelDesdeAltaConfianza(terminoAltaActiva);
      }

      actualizarFranjaConfianza(terminoBajaActivo, terminoMediaActivo, terminoAltaActiva);

      const dominanteFrame = categoriaAltaFrame || dominanteMedia || dominanteBaja;
      if (dominanteFrame) {
        const colorFrame = categoriasConColor[dominanteFrame];
        if (colorFrame) barra.registrar(video.currentTime, colorFrame);
      }
    }
    contadorAnim = requestAnimationFrame(observar);
  }

  function escalar() {
    video.width = lienzo.width = lienzoEspectros.width = video.clientWidth;
    video.height = lienzo.height = lienzoEspectros.height = video.clientHeight;

    escala.x = lienzo.width / video.videoWidth;
    escala.y = lienzo.height / video.videoHeight;

    ctx.font = '11px monospace';
  }
}

inicio().catch(console.error);
