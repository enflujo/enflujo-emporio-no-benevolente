import type { VideoLista } from '../tipos';

const lista = document.getElementById('listaVideos') as HTMLUListElement;

export async function crearMenuVideos(cargarVideo: (nombre: string, formato: string) => void) {
  const videos = (await fetch(`${import.meta.env.BASE_URL}/listaVideos.json`).then((res) =>
    res.json()
  )) as VideoLista[];
  /** Crear lista de videos disponibles */
  videos.forEach(({ nombre, formato }) => {
    const btn = document.createElement('li');
    btn.classList.add('videoBtn');
    btn.innerText = nombre;
    lista.appendChild(btn);

    btn.onclick = () => {
      const seleccionado = document.querySelector('.seleccionado');
      if (seleccionado) seleccionado.classList.remove('seleccionado');
      btn.classList.add('seleccionado');
      cargarVideo(nombre, formato);
    };
  });
}
