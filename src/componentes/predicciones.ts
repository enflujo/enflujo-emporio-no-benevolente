import type { Aparicion, Cuadro } from '../tipos';
import categoriasConColor, { categorias } from './categorias';
import { mostrarTraducciones, ocultarTraducciones, panelTraduccionesVisible } from './panelTraducciones';

const listaCategorias = document.getElementById('listaCategorias') as HTMLDivElement;
const RETARDO_HOVER_INICIAL = 70;
const RETARDO_HOVER_CAMBIO = 260;

type DatosCategoria = {
  elemento: HTMLDivElement;
  contador: HTMLSpanElement;
  apariciones: Aparicion[];
};

let registro: { [categoria: string]: DatosCategoria } = {};
let temporizadorHover: ReturnType<typeof setTimeout> | null = null;

export default function utilidadPredicciones(lienzoEspectroCategoria: HTMLCanvasElement) {
  const ctx3 = lienzoEspectroCategoria.getContext('2d');

  function construirDiccionario() {
    listaCategorias.innerHTML = '';
    registro = {};

    categorias.forEach((nombreCategoria) => {
      const elemento = document.createElement('div');
      const contador = document.createElement('span');
      const barra = document.createElement('span');
      const color = categoriasConColor[nombreCategoria];

      elemento.className = 'categoria fantasma';
      elemento.innerText = nombreCategoria;
      contador.className = 'contadorCategoria';
      contador.innerText = '0';
      barra.className = 'barraColor';
      barra.style.backgroundColor = color;

      elemento.appendChild(barra);
      elemento.appendChild(contador);
      listaCategorias.appendChild(elemento);

      elemento.onmouseenter = () => {
        if (temporizadorHover !== null) clearTimeout(temporizadorHover);
        const retardo = panelTraduccionesVisible() ? RETARDO_HOVER_CAMBIO : RETARDO_HOVER_INICIAL;

        temporizadorHover = setTimeout(() => {
          mostrarTraducciones(nombreCategoria, color);

          if (!ctx3) return;
          const { apariciones } = registro[nombreCategoria];
          if (apariciones.length === 0) return;

          lienzoEspectroCategoria.classList.add('visible');
          ctx3.clearRect(0, 0, lienzoEspectroCategoria.width, lienzoEspectroCategoria.height);
          ctx3.fillStyle = color;
          ctx3.globalAlpha = 0.05;

          apariciones.forEach(({ area }) => {
            ctx3.fillRect(area.x, area.y, area.ancho, area.alto);
          });
        }, retardo);
      };

      elemento.onmouseleave = () => {
        if (temporizadorHover !== null) {
          clearTimeout(temporizadorHover);
          temporizadorHover = null;
        }
        ocultarTraducciones();
        lienzoEspectroCategoria.classList.remove('visible');
      };

      registro[nombreCategoria] = { elemento, contador, apariciones: [] };
    });
  }

  // Construir el diccionario desde el inicio
  construirDiccionario();

  return {
    reiniciar: () => {
      // Reiniciar contadores pero mantener el diccionario visible
      categorias.forEach((nombreCategoria) => {
        const datos = registro[nombreCategoria];
        datos.apariciones = [];
        datos.contador.innerText = '0';
        datos.elemento.classList.add('fantasma');
        datos.elemento.classList.remove('detectada');
      });
    },

    agregar: (nombreCategoria: string, confianza: number, area: Cuadro, tiempo: number) => {
      const datos = registro[nombreCategoria];
      if (!datos) return;

      // Despertar la categoría si es la primera vez
      if (datos.apariciones.length === 0) {
        datos.elemento.classList.remove('fantasma');
        datos.elemento.classList.add('detectada');
      }

      datos.apariciones.push({ tiempo, area, confianza });
      datos.contador.innerText = `${datos.apariciones.length}`;
    },
  };
}
