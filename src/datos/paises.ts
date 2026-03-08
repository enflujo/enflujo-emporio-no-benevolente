// Mapeo lengua → códigos ISO 3166-1 numéricos (formato de world-atlas)
// Cada lengua referencia los países donde se habla de forma significativa

export const paisesPorLengua: { [codigo: string]: number[] } = {
  ln: [180, 178, 140], // Lingala: DR Congo, Rep. Congo, Rep. Centroafricana
  sw: [834, 404, 800, 646, 108, 180, 508, 174], // Kiswahili: Tanzania, Kenia, Uganda, Ruanda, Burundi, DRC, Mozambique, Comoras
  rw: [646, 180, 800], // Kinyarwanda: Ruanda, DRC (este), Uganda
  kg: [180, 178, 24], // Kikongo: DRC, Rep. Congo, Angola
  fr: [250, 56, 756, 442, 124, 204, 854, 120, 140, 148, 178, 180, 384, 262, 266, 324, 332, 450, 466, 478, 504, 562, 646, 686, 768, 788], // Français
  yo: [566, 204, 768], // Yorùbá: Nigeria, Benín, Togo
  ha: [566, 562, 288, 120, 148], // Hausa: Nigeria, Níger, Ghana, Camerún, Chad
  am: [231], // Amharic: Etiopía
  zu: [710, 716, 508, 426, 748], // isiZulu: Sudáfrica, Zimbabue, Mozambique, Lesoto, Esuatini
  ar: [12, 48, 174, 262, 818, 368, 400, 414, 422, 434, 478, 504, 512, 634, 682, 706, 729, 760, 788, 784, 887], // Árabe
  hi: [356, 524, 242, 780, 328, 740], // Hindi: India, Nepal, Fiyi, Trinidad, Guyana, Surinam
  qu: [604, 68, 218, 170, 32, 152], // Quechua: Perú, Bolivia, Ecuador, Colombia, Argentina, Chile
  gn: [600, 68, 32, 76], // Guaraní: Paraguay, Bolivia, Argentina, Brasil
  nah: [484], // Náhuatl: México
  zh: [156, 158, 702, 458], // Mandarin: China, Taiwán, Singapur, Malasia
  es: [724, 484, 170, 32, 604, 862, 152, 218, 68, 600, 858, 188, 591, 340, 222, 320, 558, 192, 214, 226], // Español
  pt: [76, 620, 24, 508, 132, 624, 678, 626], // Português: Brasil, Portugal, Angola, Mozambique, Cabo Verde...
};
