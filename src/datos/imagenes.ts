export type ImagenCategoria = {
  ruta: string;
  alt: string;
  fuente?: string;
  nota?: string;
};

type ImagenesPorCategoria = Partial<Record<string, ImagenCategoria[]>>;

// Estructura editable por categoría.
// Las rutas deben apuntar a archivos dentro de estaticos/imagenes/.
export const imagenesPorCategoria: ImagenesPorCategoria = {
  // person: [
  //   {
  //     ruta: 'imagenes/person/google-person-01.jpg',
  //     alt: 'Resultados de busqueda para "person"',
  //     fuente: 'Google Images',
  //     nota: 'Captura tomada el 2026-03-08',
  //   },
  // ],
};

function rutaPublica(ruta: string): string {
  if (/^(https?:)?\/\//.test(ruta) || ruta.startsWith('data:')) return ruta;
  const base = import.meta.env.BASE_URL || '/';
  const baseNormalizada = base.endsWith('/') ? base : `${base}/`;
  const rutaLimpia = ruta.replace(/^\/+/, '');
  return `${baseNormalizada}${rutaLimpia}`;
}

export function obtenerImagenesCategoria(categoria: string): ImagenCategoria[] {
  const imagenes = imagenesPorCategoria[categoria] ?? [];
  return imagenes.map((imagen) => ({
    ...imagen,
    ruta: rutaPublica(imagen.ruta),
  }));
}
