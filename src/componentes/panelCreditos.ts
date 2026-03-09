import { perfilesCreditos } from '../datos/creditos';
import { mostrarMapaPaises, resaltarPaises } from './mapa';
import { getIdioma } from '../utilidades/idioma';

const INTERVALO_ROTACION_CREDITOS = 4200;
const COLOR_CREDITOS = '#8ab4f8';

const overlay = document.getElementById('mapaOverlay') as HTMLDivElement;
const colorBar = document.getElementById('mapaColorBar') as HTMLDivElement;
const categoriaNombre = document.getElementById('mapaCategoriaNombre') as HTMLSpanElement;
const tituloSeccion = document.querySelector('#seccionTraducciones .mapaSeccionTitulo') as HTMLParagraphElement;
const lista = document.getElementById('mapaTraduccionesList') as HTMLDivElement;
const seccionImagenes = document.getElementById('seccionImagenes') as HTMLElement;
const tituloEquipoPorIdioma: Record<string, string> = {
  es: 'Equipo',
  en: 'Team',
  fr: 'Équipe',
  pt: 'Equipe',
  ln: 'Ekipa',
  sw: 'Timu',
  rw: 'Itsinda',
  kg: 'Ekipa',
  yo: 'Ẹgbẹ́',
  ha: 'Ƙungiya',
  am: 'ቡድን',
  zu: 'Ithimba',
  ar: 'الفريق',
  hi: 'टीम',
  qu: 'Ayllu',
  gn: 'Aty',
  nah: 'Tlapowalli',
  zh: '团队',
};

let filas: HTMLDivElement[] = [];
let indiceActual = 0;
let temporizador: ReturnType<typeof setInterval> | null = null;

function limpiarRotacion() {
  if (temporizador !== null) {
    clearInterval(temporizador);
    temporizador = null;
  }
}

function crearMarcaGoogle() {
  const marca = document.createElement('div');
  marca.className = 'googleMarca';

  const letras: Array<[string, string]> = [
    ['G', '#4285f4'],
    ['o', '#ea4335'],
    ['o', '#fbbc05'],
    ['g', '#4285f4'],
    ['l', '#34a853'],
    ['e', '#ea4335'],
  ];

  letras.forEach(([letra, color]) => {
    const span = document.createElement('span');
    span.textContent = letra;
    span.style.color = color;
    marca.appendChild(span);
  });

  return marca;
}

function baseConSlash() {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

function renderizarBuscadorPerfil(indice: number) {
  const perfil = perfilesCreditos[indice];
  if (!perfil) return;

  seccionImagenes.innerHTML = '';
  const marco = document.createElement('div');
  marco.className = 'buscadorSimulado buscadorCreditos';

  const cabecera = document.createElement('div');
  cabecera.className = 'buscadorCabecera';
  const marca = crearMarcaGoogle();
  const subtitulo = document.createElement('span');
  subtitulo.className = 'googleSubtitulo';
  subtitulo.textContent = 'Search';
  cabecera.appendChild(marca);
  cabecera.appendChild(subtitulo);

  const cajaBusqueda = document.createElement('div');
  cajaBusqueda.className = 'googleCajaBusqueda';
  const textoBusqueda = document.createElement('span');
  textoBusqueda.className = 'googleTextoBusqueda';
  textoBusqueda.textContent = perfil.nombre;
  cajaBusqueda.appendChild(textoBusqueda);

  const capturaWrap = document.createElement('div');
  capturaWrap.className = 'googlePerfilCapturaWrap';
  const captura = document.createElement('img');
  captura.className = 'googlePerfilCaptura';
  captura.src = `${baseConSlash()}estaticos/perfiles/${perfil.id}.jpg`;
  captura.alt = `Resultados de Google para ${perfil.nombre}`;
  captura.loading = 'lazy';
  captura.decoding = 'async';
  capturaWrap.appendChild(captura);

  marco.appendChild(cabecera);
  marco.appendChild(cajaBusqueda);
  marco.appendChild(capturaWrap);
  seccionImagenes.appendChild(marco);
}

function activarPerfil(indice: number) {
  const total = perfilesCreditos.length;
  if (total === 0) return;
  indiceActual = (indice + total) % total;
  const perfil = perfilesCreditos[indiceActual];

  filas.forEach((fila, i) => {
    fila.classList.toggle('activa', i === indiceActual);
  });

  const filaActiva = filas[indiceActual];
  if (filaActiva) {
    filaActiva.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  categoriaNombre.textContent = perfil.nombre;
  document.dispatchEvent(
    new CustomEvent('creditos:perfil-activo', {
      detail: { id: perfil.id },
    })
  );
  resaltarPaises(perfil.paises);
  renderizarBuscadorPerfil(indiceActual);
}

function iniciarRotacion() {
  limpiarRotacion();
  if (perfilesCreditos.length <= 1) return;
  temporizador = setInterval(() => {
    activarPerfil(indiceActual + 1);
  }, INTERVALO_ROTACION_CREDITOS);
}

export function mostrarPanelCreditos() {
  if (perfilesCreditos.length === 0) return;
  limpiarRotacion();
  filas = [];

  overlay.classList.add('visible');
  overlay.style.setProperty('--categoria-color', COLOR_CREDITOS);
  colorBar.style.backgroundColor = COLOR_CREDITOS;
  categoriaNombre.textContent = 'Créditos';
  tituloSeccion.textContent = tituloEquipoPorIdioma[getIdioma()] ?? tituloEquipoPorIdioma.es;

  lista.innerHTML = '';
  perfilesCreditos.forEach((perfil, indice) => {
    const fila = document.createElement('div');
    fila.className = 'tradFila creditoFila';

    const nombre = document.createElement('span');
    nombre.className = 'tradLengua';
    nombre.textContent = perfil.nombre;

    const origen = document.createElement('span');
    origen.className = 'tradPalabra';
    origen.textContent = perfil.origen;

    fila.appendChild(nombre);
    fila.appendChild(origen);
    fila.addEventListener('mouseenter', () => {
      activarPerfil(indice);
      iniciarRotacion();
    });
    fila.addEventListener('click', () => {
      activarPerfil(indice);
      iniciarRotacion();
    });

    filas.push(fila);
    lista.appendChild(fila);
  });

  const paisesActivos = Array.from(new Set(perfilesCreditos.flatMap((perfil) => perfil.paises)));
  mostrarMapaPaises(paisesActivos, COLOR_CREDITOS);
  activarPerfil(0);
  iniciarRotacion();
}

export function ocultarPanelCreditos() {
  limpiarRotacion();
}

export function actualizarIdiomaPanelCreditos() {
  tituloSeccion.textContent = tituloEquipoPorIdioma[getIdioma()] ?? tituloEquipoPorIdioma.es;
}
