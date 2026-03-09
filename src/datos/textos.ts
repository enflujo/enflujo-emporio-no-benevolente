export type TextoCategoria = {
  titulo?: string;
  parrafos: string[];
};

type TextosPorCategoria = Partial<Record<string, TextoCategoria>>;

// Estructura lista para poblar con textos criticos por categoria.
export const textosPorCategoria: TextosPorCategoria = {
  // person: {
  //   titulo: 'Nombrar no es reconocer',
  //   parrafos: [
  //     'Texto breve sobre la friccion entre archivo colonial y clasificacion automatica.',
  //   ],
  // },
};

export function obtenerTextoCategoria(categoria: string): TextoCategoria | null {
  return textosPorCategoria[categoria] ?? null;
}
