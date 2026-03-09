import type { VideoLista } from '../tipos';

const lista = document.getElementById('listaVideos') as HTMLUListElement;

export async function crearMenuVideos(alSeleccionar: (nombre: string, formato: string, indice: number) => void) {
  const videos = (await fetch(`${import.meta.env.BASE_URL}/listaVideos.json`).then((res) =>
    res.json()
  )) as VideoLista[];

  const botones: HTMLLIElement[] = [];

  videos.forEach(({ nombre, formato }, indice) => {
    const btn = document.createElement('li');
    btn.classList.add('videoBtn');
    btn.innerText = nombre;
    lista.appendChild(btn);
    botones.push(btn);

    btn.onclick = () => alSeleccionar(nombre, formato, indice);
  });

  function marcarActivo(indice: number) {
    botones.forEach((b) => b.classList.remove('seleccionado'));
    botones[indice]?.classList.add('seleccionado');
    botones[indice]?.scrollIntoView({ block: 'nearest' });
  }

  return { videos, marcarActivo };
}
