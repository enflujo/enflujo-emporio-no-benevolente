export function controlesPantallaCompleta() {
  const controles = document.getElementById('controles') as HTMLDivElement;
  const botonCerrar = document.getElementById('cerrarControles') as HTMLSpanElement;

  let panelAbierto = false;

  function abrir() {
    panelAbierto = true;
    controles.classList.add('abierto');
    botonCerrar.innerText = '×';
  }

  function cerrar() {
    panelAbierto = false;
    controles.classList.remove('abierto');
    botonCerrar.innerText = '☰ videos';
  }

  cerrar();

  botonCerrar.onclick = (evento) => {
    evento.stopPropagation();
    if (panelAbierto) cerrar();
    else abrir();
  };

  controles.addEventListener('click', (evento) => {
    evento.stopPropagation();
  });

  document.addEventListener('click', () => {
    if (panelAbierto) cerrar();
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && panelAbierto) cerrar();
  });
}
