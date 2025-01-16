export type Cuadro = {
  x: number;
  y: number;
  ancho: number;
  alto: number;
};

export type Aparicion = {
  tiempo: number;
  area: Cuadro;
  confianza: number;
};

export type VideoLista = {
  nombre: string;
  formato: string;
};
