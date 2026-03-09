import { idiomasUI } from '../datos/ui';
import { setIdioma, getIdioma, onCambioIdioma } from '../utilidades/idioma';

export function crearSelectorIdioma() {
  const contenedor = document.getElementById('barraIdiomas');
  if (!contenedor) return;
  contenedor.innerHTML = '';

  const franja = document.createElement('div');
  franja.className = 'chipsIdioma';

  const botones = new Map<string, HTMLButtonElement>();
  Object.entries(idiomasUI).forEach(([codigo, nombre]) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'chipIdioma';
    boton.textContent = nombre;
    boton.setAttribute('data-codigo', codigo);
    boton.setAttribute('aria-pressed', String(codigo === getIdioma()));
    if (codigo === getIdioma()) boton.classList.add('activo');

    boton.addEventListener('click', () => {
      setIdioma(codigo);
    });

    botones.set(codigo, boton);
    franja.appendChild(boton);
  });

  // Sincronizar si el idioma cambia desde otro origen
  onCambioIdioma(() => {
    const actual = getIdioma();
    botones.forEach((boton, codigo) => {
      const activo = codigo === actual;
      boton.classList.toggle('activo', activo);
      boton.setAttribute('aria-pressed', String(activo));
    });
  });

  contenedor.appendChild(franja);
}
