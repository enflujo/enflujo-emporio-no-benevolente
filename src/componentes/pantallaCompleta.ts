export function controlesPantallaCompleta() {
  const controles = document.getElementById('controles') as HTMLDivElement;
  const botonCerrar = document.getElementById('cerrarControles') as HTMLButtonElement;

  let pantallaCompleta = false;

  botonCerrar.onclick = () => {
    if (!pantallaCompleta) {
      controles.classList.add('oculto');
      botonCerrar.innerText = '>>';
    } else {
      controles.classList.remove('oculto');
      botonCerrar.innerText = 'X';
    }
    pantallaCompleta = !pantallaCompleta;
  };
}
