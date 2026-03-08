export function controlesPantallaCompleta() {
  const controles = document.getElementById('controles') as HTMLDivElement;
  const botonCerrar = document.getElementById('cerrarControles') as HTMLButtonElement;

  let panelOculto = false;

  botonCerrar.onclick = () => {
    panelOculto = !panelOculto;
    controles.classList.toggle('oculto', panelOculto);
    botonCerrar.innerText = panelOculto ? '>>' : 'X';
  };
}
