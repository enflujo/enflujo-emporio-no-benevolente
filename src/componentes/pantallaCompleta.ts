const contenedor = document.getElementById('contenedor') as HTMLElement;
const controles = document.getElementById('controles') as HTMLDivElement;
const iconoFullScreen = document.getElementById('iconoFullScreen') as HTMLButtonElement;
let pantallaCompleta = false;

function cambiarModoPantalla() {
  if (!pantallaCompleta) {
    controles.classList.add('oculto');
    contenedor.classList.add('pantallaCompleta');
    iconoFullScreen.innerText = 'Exit full screen';
  } else {
    controles.classList.remove('oculto');
    contenedor.classList.remove('pantallaCompleta');
    iconoFullScreen.innerText = 'Full screen';
  }
  pantallaCompleta = !pantallaCompleta;
}

export function controlesPantallaCompleta() {
  iconoFullScreen.onclick = cambiarModoPantalla;
}
