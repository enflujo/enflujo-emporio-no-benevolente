import type { Aparicion, Cuadro } from '../tipos';
import categoriasConColor, { categorias } from './categorias';

const listaCategorias = document.getElementById('listaCategorias') as HTMLDivElement;
type DatosCategoria = {
  elemento: HTMLDivElement;
  contador: HTMLSpanElement;
  apariciones: Aparicion[];
};

let registro: { [categoria: string]: DatosCategoria } = {};

export default function utilidadPredicciones() {

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
