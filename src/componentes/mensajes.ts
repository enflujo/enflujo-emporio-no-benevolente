const contenedorMensaje = document.getElementById('mensaje') as HTMLDivElement;

export function imprimirMensaje(mensaje: string) {
  contenedorMensaje.innerText = mensaje;
}
