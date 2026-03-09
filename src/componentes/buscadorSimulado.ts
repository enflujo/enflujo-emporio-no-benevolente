import type { TraduccionesCategoria } from '../datos/traducciones';

type MetaImagen = {
  rutaLocal?: string;
  titulo?: string | null;
  fuentePagina?: string | null;
  fuenteImagen?: string | null;
};

type MetaBusqueda = {
  termino: string;
  idioma: string;
  nombreIdioma?: string;
  imagenes: MetaImagen[];
};

type OpcionesBuscadorSimulado = {
  contenedor: HTMLElement;
  categoria: string;
  color: string;
  traduccionesCategoria: TraduccionesCategoria;
  idiomasDisponibles: { [codigo: string]: string };
  alInteraccionar?: (idioma: string) => void;
};

export type ControlBuscadorSimulado = {
  hayDatos: boolean;
  mostrarIdioma: (idioma: string, animar?: boolean) => Promise<boolean>;
  destruir: () => void;
};

const VERSION_BUSQUEDAS = import.meta.env.VITE_BUSQUEDAS_VERSION || '2026-03-08';
const cacheMeta = new Map<string, Promise<MetaBusqueda | null>>();

function baseConSlash() {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

function slugSeguro(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function rutaPublica(ruta: string): string {
  if (/^(https?:)?\/\//.test(ruta) || ruta.startsWith('data:')) return ruta;
  const limpia = ruta
    .replace(/\\/g, '/')
    .replace(/^estaticos\//, '')
    .replace(/^\/+/, '');
  return `${baseConSlash()}${limpia}`;
}

async function cargarMeta(categoria: string, idioma: string): Promise<MetaBusqueda | null> {
  const categoriaSlug = slugSeguro(categoria);
  const ruta = `${baseConSlash()}imagenes/busquedas-google/${VERSION_BUSQUEDAS}/${categoriaSlug}/${idioma}/meta.json`;

  if (!cacheMeta.has(ruta)) {
    cacheMeta.set(
      ruta,
      fetch(ruta).then((respuesta) => {
        if (!respuesta.ok) return null;
        return respuesta.json() as Promise<MetaBusqueda>;
      })
    );
  }
  return cacheMeta.get(ruta)!;
}

function crearElemento<K extends keyof HTMLElementTagNameMap>(tag: K, clase?: string): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (clase) el.className = clase;
  return el;
}

function animarTexto(el: HTMLElement, texto: string, velocidad = 14): () => void {
  let indice = 0;
  el.textContent = '';
  const id = window.setInterval(() => {
    indice += 1;
    el.textContent = texto.slice(0, indice);
    if (indice >= texto.length) window.clearInterval(id);
  }, velocidad);
  return () => window.clearInterval(id);
}

function crearMarcaGoogle() {
  const marca = crearElemento('div', 'googleMarca');
  const letras = [
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

function obtenerDominio(url: string | null | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export async function crearBuscadorSimulado({
  contenedor,
  categoria,
  color,
  traduccionesCategoria,
  idiomasDisponibles,
  alInteraccionar,
}: OpcionesBuscadorSimulado): Promise<ControlBuscadorSimulado> {
  contenedor.innerHTML = '';
  contenedor.style.setProperty('--categoria-color', color);

  const idiomas = ['en', ...Object.keys(traduccionesCategoria)];
  const marco = crearElemento('div', 'buscadorSimulado');
  const cabecera = crearElemento('div', 'buscadorCabecera');
  const marca = crearMarcaGoogle();
  const subtitulo = crearElemento('span', 'googleSubtitulo');
  subtitulo.textContent = 'Images';
  cabecera.appendChild(marca);
  cabecera.appendChild(subtitulo);

  const cajaBusqueda = crearElemento('div', 'googleCajaBusqueda');
  const textoBusqueda = crearElemento('span', 'googleTextoBusqueda');
  cajaBusqueda.appendChild(textoBusqueda);

  const tabs = crearElemento('div', 'googleTabs');
  ['All', 'Images', 'Shopping', 'News'].forEach((tab) => {
    const item = crearElemento('span', `googleTab ${tab === 'Images' ? 'activa' : ''}`);
    item.textContent = tab;
    tabs.appendChild(item);
  });

  const chips = crearElemento('div', 'googleIdiomas');
  const estado = crearElemento('p', 'googleEstado');
  const grid = crearElemento('div', 'googleGrid');

  marco.appendChild(cabecera);
  marco.appendChild(cajaBusqueda);
  marco.appendChild(tabs);
  marco.appendChild(chips);
  marco.appendChild(estado);
  marco.appendChild(grid);
  contenedor.appendChild(marco);

  const botones = new Map<string, HTMLButtonElement>();
  let tokenRender = 0;
  let cancelarAnimacion: () => void = () => {};
  let destruido = false;
  let hayDatos = false;

  idiomas.forEach((codigo) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'googleChipIdioma';
    boton.textContent = codigo === 'en' ? 'English' : (idiomasDisponibles[codigo] ?? codigo);
    boton.addEventListener('click', () => {
      if (destruido) return;
      alInteraccionar?.(codigo);
      void mostrarIdioma(codigo, false);
    });
    chips.appendChild(boton);
    botones.set(codigo, boton);
  });

  async function mostrarIdioma(idioma: string, animar = true): Promise<boolean> {
    if (destruido) return false;
    tokenRender += 1;
    const token = tokenRender;

    botones.forEach((boton, codigo) => {
      boton.classList.toggle('activo', codigo === idioma);
    });

    const termino = idioma === 'en' ? categoria : (traduccionesCategoria[idioma] ?? categoria);
    cancelarAnimacion();
    if (animar) {
      cancelarAnimacion = animarTexto(textoBusqueda, termino);
    } else {
      textoBusqueda.textContent = termino;
    }

    estado.textContent = `Loading ${idioma.toUpperCase()}...`;
    grid.innerHTML = '';

    const meta = await cargarMeta(categoria, idioma);
    if (destruido || token !== tokenRender) return false;

    if (!meta || !Array.isArray(meta.imagenes) || meta.imagenes.length === 0) {
      estado.textContent = `No cached images for ${idioma.toUpperCase()}.`;
      return false;
    }

    hayDatos = true;
    estado.textContent = `${meta.imagenes.length} results · ${meta.idioma.toUpperCase()} · ${meta.termino}`;

    meta.imagenes.forEach((imagen, i) => {
      const tarjeta = crearElemento('article', 'googleResultado');
      const enlace = document.createElement('a');
      enlace.className = 'googleResultadoLink';
      enlace.href = imagen.fuentePagina || '#';
      enlace.target = '_blank';
      enlace.rel = 'noreferrer noopener';

      const foto = document.createElement('img');
      foto.loading = 'lazy';
      foto.decoding = 'async';
      foto.alt = imagen.titulo || `${meta.termino} (${i + 1})`;
      foto.src = rutaPublica(imagen.rutaLocal || imagen.fuenteImagen || '');
      enlace.appendChild(foto);

      const titulo = crearElemento('p', 'googleResultadoTitulo');
      titulo.textContent = imagen.titulo || 'Untitled result';
      const fuente = crearElemento('p', 'googleResultadoFuente');
      const dominio = obtenerDominio(imagen.fuentePagina || imagen.fuenteImagen);
      fuente.textContent = dominio || 'source unavailable';

      tarjeta.appendChild(enlace);
      tarjeta.appendChild(fuente);
      tarjeta.appendChild(titulo);
      grid.appendChild(tarjeta);
    });

    return true;
  }

  const ordenInicial = idiomas.includes('en') ? ['en', ...idiomas.filter((c) => c !== 'en')] : idiomas;
  for (const codigo of ordenInicial) {
    const cargado = await mostrarIdioma(codigo, codigo === 'en');
    if (cargado) break;
  }

  return {
    hayDatos,
    mostrarIdioma,
    destruir: () => {
      destruido = true;
      cancelarAnimacion();
      contenedor.innerHTML = '';
    },
  };
}
