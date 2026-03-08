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

export async function inicializarMapa() {
  const world = worldData as unknown as Topology<Objects>;
  const paises = feature(world, world.objects.countries as any);

  const ancho = mapaArea.clientWidth || overlay.clientWidth;
  const alto = mapaArea.clientHeight || overlay.clientHeight;

  const proyeccion = geoNaturalEarth1().fitSize([ancho, alto], paises as any);
  const trazador = geoPath(proyeccion);

  svgEl.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
  svgEl.setAttribute('width', String(ancho));
  svgEl.setAttribute('height', String(alto));

  (paises as any).features.forEach((pais: any) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = trazador(pais);
    if (!d) return;
    path.setAttribute('d', d);
    path.setAttribute('data-id', String(pais.id));
    path.classList.add('pais');
    svgEl.appendChild(path);
  });
}

export function mostrarMapa(idiomasActivos: string[]) {
  paisesActivos = new Set<number>();

  idiomasActivos.forEach((codigo) => {
    (paisesPorLengua[codigo] || []).forEach((id) => paisesActivos.add(id));
  });

  // Aplicar color tenue a todos los países relacionados con cualquier idioma
  svgEl.querySelectorAll<SVGPathElement>('.pais').forEach((path) => {
    const id = Number(path.getAttribute('data-id'));
    if (paisesActivos.has(id)) {
      path.style.fill = 'rgba(255, 255, 255, 0.22)';
      path.style.opacity = '1';
      path.style.stroke = 'rgba(255, 255, 255, 0.72)';
      path.style.strokeWidth = '0.7px';
    } else {
      path.style.fill = 'rgba(0, 0, 0, 0.1)';
      path.style.opacity = '1';
      path.style.stroke = 'rgba(0, 0, 0, 0.2)';
      path.style.strokeWidth = '0.35px';
    }
  });

  overlay.classList.add('visible');
}

export function resaltarLengua(codigo: string | null) {
  const paisesLengua = new Set<number>(codigo ? paisesPorLengua[codigo] || [] : []);

  svgEl.querySelectorAll<SVGPathElement>('.pais').forEach((path) => {
    const id = Number(path.getAttribute('data-id'));

    if (!paisesActivos.has(id)) {
      path.style.fill = 'rgba(0, 0, 0, 0.1)';
      path.style.opacity = '1';
      path.style.stroke = 'rgba(0, 0, 0, 0.2)';
      path.style.strokeWidth = '0.35px';
      return;
    }

    if (codigo === null) {
      path.style.fill = 'rgba(255, 255, 255, 0.22)';
      path.style.opacity = '1';
      path.style.stroke = 'rgba(255, 255, 255, 0.72)';
      path.style.strokeWidth = '0.7px';
    } else if (paisesLengua.has(id)) {
      path.style.fill = 'rgba(255, 255, 255, 0.52)';
      path.style.opacity = '1';
      path.style.stroke = 'rgba(255, 255, 255, 0.96)';
      path.style.strokeWidth = '1.05px';
    } else {
      path.style.fill = 'rgba(255, 255, 255, 0.08)';
      path.style.opacity = '1';
      path.style.stroke = 'rgba(255, 255, 255, 0.25)';
      path.style.strokeWidth = '0.45px';
    }
  });
}

export function ocultarMapa() {
  overlay.classList.remove('visible');
  // Limpiar estilos
  svgEl.querySelectorAll<SVGPathElement>('.pais').forEach((path) => {
    path.style.fill = '';
    path.style.opacity = '';
  });
}
