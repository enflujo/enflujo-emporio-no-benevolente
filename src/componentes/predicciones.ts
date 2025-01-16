import type { Aparicion, Cuadro } from '../tipos';
import categoriasConColor from './categorias';

const lienzo2 = document.getElementById('lienzo2') as HTMLCanvasElement;
const lienzo3 = document.getElementById('lienzo3') as HTMLCanvasElement;
const ctx3 = lienzo3.getContext('2d');
const listaCategorias = document.getElementById('listaCategorias') as HTMLDivElement;
let categorias: { [categoria: string]: { contador: HTMLSpanElement; apariciones: Aparicion[] } } = {};

export default {
  reiniciar: () => {
    listaCategorias.innerHTML = '';
    categorias = {};
  },

  agregar: (nombreCategoria: string, confianza: number, area: Cuadro, tiempo: number) => {
    const categoria = categorias[nombreCategoria];

    if (!categoria) {
      const elemento = document.createElement('div');
      const contador = document.createElement('span');
      const barra = document.createElement('span');
      const color = categoriasConColor[nombreCategoria];

      elemento.className = 'categoria';
      elemento.innerText = nombreCategoria;
      contador.className = 'contadorCategoria';
      contador.innerText = '1';
      barra.className = 'barraColor';
      barra.style.backgroundColor = color;

      elemento.appendChild(barra);
      elemento.appendChild(contador);
      listaCategorias.appendChild(elemento);

      elemento.onclick = () => {
        console.log(`Apariciones de categoría ${nombreCategoria}`, categorias[nombreCategoria].apariciones);
      };

      elemento.onmouseenter = () => {
        if (!ctx3) return;

        lienzo2.classList.remove('visible');
        lienzo3.classList.add('visible');

        ctx3.clearRect(0, 0, lienzo3.width, lienzo3.height);

        const { apariciones } = categorias[nombreCategoria];

        if (apariciones && apariciones.length) {
          ctx3.fillStyle = color;
          ctx3.globalAlpha = 0.05;

          apariciones.forEach(({ area }) => {
            ctx3.fillRect(area.x, area.y, area.alto, area.alto);
          });
        }
      };

      elemento.onmouseleave = () => {
        lienzo2.classList.add('visible');
        lienzo3.classList.remove('visible');
      };

      categorias[nombreCategoria] = { contador, apariciones: [] };
    } else {
      categoria.contador.innerText = `${categoria.apariciones.length + 1}`;
    }

    categorias[nombreCategoria].apariciones.push({ tiempo, area, confianza });
  },

  apariciones: () => {
    return categorias.apariciones;
  },
};
