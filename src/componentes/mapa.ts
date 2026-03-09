import { feature } from 'topojson-client';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { Topology, Objects } from 'topojson-specification';
import { paisesPorLengua } from '../datos/paises';

// @ts-ignore — world-atlas no tiene tipos oficiales
import worldData from 'world-atlas/countries-110m.json';

const overlay = document.getElementById('mapaOverlay') as HTMLDivElement;
const mapaArea = document.getElementById('mapaArea') as HTMLDivElement;
const svgEl = document.getElementById('mapaMundi') as unknown as SVGSVGElement;

let paisesActivos = new Set<number>();
let paisesResaltadosActuales: Set<number> | null = null;
let colorCategoriaActual = '#ffffff';
let coleccionPaises: any = null;
const FACTOR_OCUPACION_MAPA = 1.0;
let usarSoloPoligonoPrincipal = false;

function hexARgba(colorHex: string, alpha: number) {
  const limpia = colorHex.trim();
  const valor = limpia.startsWith('#') ? limpia.slice(1) : limpia;
  const esCorta = valor.length === 3;
  const esLarga = valor.length === 6;
  if (!esCorta && !esLarga) return `rgba(255, 255, 255, ${alpha})`;

  const hex = esCorta
    ? valor
        .split('')
        .map((c) => `${c}${c}`)
        .join('')
    : valor;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export async function inicializarMapa() {
  const world = worldData as unknown as Topology<Objects>;
  coleccionPaises = feature(world, world.objects.countries as any);
  renderizarMapa();

  window.addEventListener('resize', () => {
    renderizarMapa();
    aplicarEstilosPaisesPorConjunto(paisesResaltadosActuales);
  });
}

function areaAnillo(coordenadas: number[][]): number {
  let area = 0;
  for (let i = 0; i < coordenadas.length; i += 1) {
    const [x1, y1] = coordenadas[i];
    const [x2, y2] = coordenadas[(i + 1) % coordenadas.length];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

function geometriaPrincipal(geometria: any) {
  if (!geometria || geometria.type !== 'MultiPolygon' || !Array.isArray(geometria.coordinates)) {
    return geometria;
  }

  let indiceMayor = 0;
  let areaMayor = 0;

  geometria.coordinates.forEach((poligono: number[][][], indice: number) => {
    const anilloExterior = poligono?.[0];
    if (!anilloExterior || anilloExterior.length < 3) return;
    const area = areaAnillo(anilloExterior);
    if (area > areaMayor) {
      areaMayor = area;
      indiceMayor = indice;
    }
  });

  return {
    type: 'Polygon',
    coordinates: geometria.coordinates[indiceMayor],
  };
}

function coleccionRenderizada() {
  if (!usarSoloPoligonoPrincipal) return coleccionPaises;
  return {
    ...coleccionPaises,
    features: (coleccionPaises as any).features.map((pais: any) => ({
      ...pais,
      geometry: geometriaPrincipal(pais.geometry),
    })),
  };
}

function renderizarMapa() {
  if (!coleccionPaises) return;
  const coleccion = coleccionRenderizada();

  const ancho = mapaArea.clientWidth || overlay.clientWidth;
  const alto = mapaArea.clientHeight || overlay.clientHeight;
  if (!ancho || !alto) return;

  const paddingX = Math.max(8, Math.round(ancho * 0.02));
  const paddingY = Math.max(8, Math.round(alto * 0.03));
  const proyeccion = geoNaturalEarth1().fitExtent(
    [
      [paddingX, paddingY],
      [ancho - paddingX, alto - paddingY],
    ],
    coleccion as any
  );
  const trazador = geoPath(proyeccion);

  // Escalar para ocupar mejor el panel y luego recentrar.
  proyeccion.scale(proyeccion.scale() * FACTOR_OCUPACION_MAPA);

  let limites = trazador.bounds(coleccion as any);
  let centroX = (limites[0][0] + limites[1][0]) / 2;
  let centroY = (limites[0][1] + limites[1][1]) / 2;
  let traslacion = proyeccion.translate();
  proyeccion.translate([traslacion[0] + (ancho / 2 - centroX), traslacion[1] + (alto / 2 - centroY)]);

  // Segundo ajuste para compensar redondeos tras el cambio de escala.
  limites = trazador.bounds(coleccion as any);
  centroX = (limites[0][0] + limites[1][0]) / 2;
  centroY = (limites[0][1] + limites[1][1]) / 2;
  traslacion = proyeccion.translate();
  proyeccion.translate([traslacion[0] + (ancho / 2 - centroX), traslacion[1] + (alto / 2 - centroY)]);

  // Si la expansión hace que el mapa se recorte, reducir escala y recentrar.
  limites = trazador.bounds(coleccion as any);
  const anchoMapa = limites[1][0] - limites[0][0];
  const altoMapa = limites[1][1] - limites[0][1];
  const anchoDisponible = Math.max(1, ancho - paddingX * 2);
  const altoDisponible = Math.max(1, alto - paddingY * 2);
  const factorAjuste = Math.min(anchoDisponible / anchoMapa, altoDisponible / altoMapa, 1);

  if (factorAjuste < 1) {
    proyeccion.scale(proyeccion.scale() * factorAjuste);
    limites = trazador.bounds(coleccion as any);
    centroX = (limites[0][0] + limites[1][0]) / 2;
    centroY = (limites[0][1] + limites[1][1]) / 2;
    traslacion = proyeccion.translate();
    proyeccion.translate([traslacion[0] + (ancho / 2 - centroX), traslacion[1] + (alto / 2 - centroY)]);
  }

  svgEl.innerHTML = '';
  svgEl.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
  svgEl.setAttribute('width', String(ancho));
  svgEl.setAttribute('height', String(alto));

  (coleccion as any).features.forEach((pais: any) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = trazador(pais);
    if (!d) return;
    path.setAttribute('d', d);
    path.setAttribute('data-id', String(pais.id));
    path.classList.add('pais');
    svgEl.appendChild(path);
  });
}

function aplicarEstilosPaises(codigo: string | null = null) {
  const paisesLengua = new Set<number>(codigo ? paisesPorLengua[codigo] || [] : []);
  paisesResaltadosActuales = codigo ? paisesLengua : null;
  aplicarEstilosPaisesPorConjunto(paisesResaltadosActuales);
}

function aplicarEstilosPaisesPorConjunto(paisesResaltados: Set<number> | null = null) {

  svgEl.querySelectorAll<SVGPathElement>('.pais').forEach((path) => {
    const id = Number(path.getAttribute('data-id'));

    if (!paisesActivos.has(id)) {
      path.style.fill = 'rgba(0, 0, 0, 0.55)';
      path.style.opacity = '1';
      path.style.stroke = 'rgba(255, 255, 255, 0.06)';
      path.style.strokeWidth = '0.35px';
      return;
    }

    if (!paisesResaltados) {
      path.style.fill = hexARgba(colorCategoriaActual, 0.26);
      path.style.opacity = '1';
      path.style.stroke = hexARgba(colorCategoriaActual, 0.62);
      path.style.strokeWidth = '0.7px';
    } else if (paisesResaltados.has(id)) {
      path.style.fill = hexARgba(colorCategoriaActual, 0.66);
      path.style.opacity = '1';
      path.style.stroke = hexARgba(colorCategoriaActual, 0.95);
      path.style.strokeWidth = '1px';
    } else {
      path.style.fill = hexARgba(colorCategoriaActual, 0.14);
      path.style.opacity = '1';
      path.style.stroke = hexARgba(colorCategoriaActual, 0.32);
      path.style.strokeWidth = '0.45px';
    }
  });
}

export function mostrarMapa(idiomasActivos: string[]) {
  usarSoloPoligonoPrincipal = false;
  paisesActivos = new Set<number>();
  const colorCSS = getComputedStyle(overlay).getPropertyValue('--categoria-color').trim();
  colorCategoriaActual = colorCSS || '#ffffff';

  idiomasActivos.forEach((codigo) => {
    (paisesPorLengua[codigo] || []).forEach((id) => paisesActivos.add(id));
  });
  paisesResaltadosActuales = null;

  renderizarMapa();
  aplicarEstilosPaises();

  overlay.classList.add('visible');
}

export function mostrarMapaPaises(listaPaisesActivos: number[], color = '#8ab4f8') {
  usarSoloPoligonoPrincipal = true;
  paisesActivos = new Set<number>(listaPaisesActivos);
  paisesResaltadosActuales = null;
  colorCategoriaActual = color;
  overlay.style.setProperty('--categoria-color', color);

  renderizarMapa();
  aplicarEstilosPaisesPorConjunto();
  overlay.classList.add('visible');
}

export function resaltarLengua(codigo: string | null) {
  aplicarEstilosPaises(codigo);
}

export function resaltarPaises(listaPaises: number[] | null) {
  paisesResaltadosActuales = listaPaises ? new Set<number>(listaPaises) : null;
  aplicarEstilosPaisesPorConjunto(paisesResaltadosActuales);
}

export function ocultarMapa() {
  overlay.classList.remove('visible');
  paisesResaltadosActuales = null;
  // Limpiar estilos
  svgEl.querySelectorAll<SVGPathElement>('.pais').forEach((path) => {
    path.style.fill = '';
    path.style.opacity = '';
  });
}
