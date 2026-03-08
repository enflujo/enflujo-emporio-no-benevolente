import { traducciones, idiomas } from '../datos/traducciones';
import { obtenerImagenesCategoria } from '../datos/imagenes';
import { obtenerTextoCategoria } from '../datos/textos';
import { mostrarMapa, resaltarLengua, ocultarMapa } from './mapa';
import { crearBuscadorSimulado, type ControlBuscadorSimulado } from './buscadorSimulado';

// Fallback de inactividad: 3 minutos
const TIEMPO_CIERRE_INACTIVIDAD = 3 * 60 * 1000;
const INTERVALO_AUTORRECORRIDO = 1000;

const overlay = document.getElementById('mapaOverlay') as HTMLDivElement;
const botonVolver = document.getElementById('mapaVolver') as HTMLButtonElement;
const colorBar = document.getElementById('mapaColorBar') as HTMLDivElement;
const categoriaNombre = document.getElementById('mapaCategoriaNombre') as HTMLSpanElement;
const traduccionesList = document.getElementById('mapaTraduccionesList') as HTMLDivElement;
const seccionTexto = document.getElementById('seccionTexto') as HTMLElement;
const seccionImagenes = document.getElementById('seccionImagenes') as HTMLElement;

let temporizador: ReturnType<typeof setTimeout> | null = null;
let pausarVideo: () => void = () => {};
let reanudarVideo: () => void = () => {};
let tokenRenderImagenes = 0;
let controladorBuscador: ControlBuscadorSimulado | null = null;
let temporizadorRecorrido: ReturnType<typeof setInterval> | null = null;
let idiomaActual: string | null = null;
let idiomaPersistente: string | null = null;
let ordenIdiomasActivos: string[] = [];
let filasPorIdioma: { [codigo: string]: HTMLDivElement } = {};

function limpiarNodo(elemento: HTMLElement) {
  elemento.innerHTML = '';
}

function limpiarRecorrido() {
  if (temporizadorRecorrido !== null) {
    clearInterval(temporizadorRecorrido);
    temporizadorRecorrido = null;
  }
}

function activarIdioma(codigo: string | null, actualizarBuscador = true) {
  idiomaActual = codigo;
  if (codigo) idiomaPersistente = codigo;
  Object.entries(filasPorIdioma).forEach(([idioma, fila]) => {
    fila.classList.toggle('activa', codigo === idioma);
  });
  resaltarLengua(codigo);

  if (actualizarBuscador && codigo && controladorBuscador) {
    void controladorBuscador.mostrarIdioma(codigo, false);
  }
}

function iniciarRecorridoAutomatico() {
  limpiarRecorrido();
  if (ordenIdiomasActivos.length <= 1) return;

  temporizadorRecorrido = setInterval(() => {
    const actual = Math.max(ordenIdiomasActivos.indexOf(idiomaActual || ''), 0);
    const siguiente = (actual + 1) % ordenIdiomasActivos.length;
    activarIdioma(ordenIdiomasActivos[siguiente], true);
  }, INTERVALO_AUTORRECORRIDO);
}

function renderizarTexto(categoria: string) {
  limpiarNodo(seccionTexto);
  const texto = obtenerTextoCategoria(categoria);

  if (!texto) {
    const placeholder = document.createElement('p');
    placeholder.className = 'contenidoVacio';
    placeholder.textContent = 'Texto critico en construccion para esta categoria.';
    seccionTexto.appendChild(placeholder);
    return;
  }

  if (texto.titulo) {
    const titulo = document.createElement('p');
    titulo.className = 'mapaSeccionTitulo';
    titulo.textContent = texto.titulo;
    seccionTexto.appendChild(titulo);
  }

  texto.parrafos.forEach((contenido) => {
    const parrafo = document.createElement('p');
    parrafo.className = 'parrafoCritico';
    parrafo.textContent = contenido;
    seccionTexto.appendChild(parrafo);
  });
}

function renderizarImagenesLocales(categoria: string, color: string) {
  limpiarNodo(seccionImagenes);
  seccionImagenes.style.setProperty('--categoria-color', color);
  const imagenes = obtenerImagenesCategoria(categoria);

  if (imagenes.length === 0) {
    const placeholder = document.createElement('p');
    placeholder.className = 'contenidoVacio';
    placeholder.textContent = 'Sin imagenes cargadas para esta categoria.';
    seccionImagenes.appendChild(placeholder);
    return;
  }

  const galeria = document.createElement('div');
  galeria.className = 'galeriaImagenes';

  imagenes.forEach((imagen) => {
    const figura = document.createElement('figure');
    figura.className = 'imagenCategoria';

    const foto = document.createElement('img');
    foto.src = imagen.ruta;
    foto.alt = imagen.alt;
    foto.loading = 'lazy';
    foto.decoding = 'async';
    figura.appendChild(foto);

    if (imagen.fuente || imagen.nota) {
      const pie = document.createElement('figcaption');
      pie.className = 'imagenPie';
      pie.textContent = [imagen.fuente, imagen.nota].filter(Boolean).join(' · ');
      figura.appendChild(pie);
    }

    galeria.appendChild(figura);
  });

  seccionImagenes.appendChild(galeria);
}

function renderizarImagenes(categoria: string, color: string, traduccionesCategoria: { [codigo: string]: string }) {
  const tokenActual = ++tokenRenderImagenes;
  if (controladorBuscador) {
    controladorBuscador.destruir();
    controladorBuscador = null;
  }

  void crearBuscadorSimulado({
    contenedor: seccionImagenes,
    categoria,
    color,
    traduccionesCategoria,
    idiomasDisponibles: idiomas,
    alInteraccionar: (idioma) => {
      activarIdioma(idioma, false);
    },
  })
    .then((control) => {
      if (tokenActual !== tokenRenderImagenes) return;
      controladorBuscador = control;
      if (idiomaActual) {
        void control.mostrarIdioma(idiomaActual, false);
      }
      if (!control.hayDatos) {
        renderizarImagenesLocales(categoria, color);
      }
    })
    .catch(() => {
      if (tokenActual !== tokenRenderImagenes) return;
      renderizarImagenesLocales(categoria, color);
    });
}

function cerrar() {
  limpiarRecorrido();
  if (controladorBuscador) {
    controladorBuscador.destruir();
    controladorBuscador = null;
  }
  overlay.classList.remove('visible');
  ocultarMapa();
  reanudarVideo();
  if (temporizador !== null) {
    clearTimeout(temporizador);
    temporizador = null;
  }
}

function reiniciarTemporizador() {
  if (!overlay.classList.contains('visible')) return;
  if (temporizador !== null) clearTimeout(temporizador);
  temporizador = setTimeout(cerrar, TIEMPO_CIERRE_INACTIVIDAD);
}

// Cerrar con botón
botonVolver.addEventListener('click', cerrar);

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('visible')) cerrar();
});

// Reiniciar temporizador con actividad del mouse
document.addEventListener('mousemove', reiniciarTemporizador);

export function inicializarPanel(callbacks: { pausar: () => void; reanudar: () => void }) {
  pausarVideo = callbacks.pausar;
  reanudarVideo = callbacks.reanudar;
}

export function mostrarTraducciones(categoria: string, color: string) {
  const data = traducciones[categoria];
  if (!data) return;
  limpiarRecorrido();
  filasPorIdioma = {};
  ordenIdiomasActivos = [];
  idiomaActual = null;

  // Cabecera
  categoriaNombre.textContent = categoria;
  colorBar.style.backgroundColor = color;
  overlay.style.setProperty('--categoria-color', color);

  // Traducciones
  traduccionesList.innerHTML = '';
  const codigosDisponibles = Object.keys(idiomas).filter((c) => data[c]);

  Object.entries(idiomas).forEach(([codigo, nombreIdioma]) => {
    const traduccion = data[codigo];
    if (!traduccion) return;

    const fila = document.createElement('div');
    fila.className = 'tradFila';

    const lengua = document.createElement('span');
    lengua.className = 'tradLengua';
    lengua.textContent = nombreIdioma;

    const palabra = document.createElement('span');
    palabra.className = 'tradPalabra';
    palabra.textContent = traduccion;

    fila.appendChild(lengua);
    fila.appendChild(palabra);
    traduccionesList.appendChild(fila);
    filasPorIdioma[codigo] = fila;
    ordenIdiomasActivos.push(codigo);

    fila.onmouseenter = () => {
      activarIdioma(codigo, true);
    };
  });

  renderizarTexto(categoria);
  renderizarImagenes(categoria, color, data);
  const idiomaInicial =
    idiomaPersistente && codigosDisponibles.includes(idiomaPersistente)
      ? idiomaPersistente
      : (codigosDisponibles[0] ?? null);

  activarIdioma(idiomaInicial, true);
  iniciarRecorridoAutomatico();

  pausarVideo();
  mostrarMapa(codigosDisponibles);
  overlay.classList.add('visible');
  reiniciarTemporizador();
}

export function ocultarTraducciones() {
  // No cerrar al salir del hover — el usuario cierra manualmente o por inactividad
}

export function panelTraduccionesVisible() {
  return overlay.classList.contains('visible');
}
