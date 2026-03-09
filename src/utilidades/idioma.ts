import { ui, idiomaDefecto, type ClaveUI } from '../datos/ui';

let codigoActual: string = idiomaDefecto;

const oyentes: Array<() => void> = [];

// Persistir idioma elegido entre sesiones
try {
  const guardado = localStorage.getItem('idioma-ui');
  if (guardado && ui[guardado]) codigoActual = guardado;
} catch {}

/** Traduce una clave de UI al idioma activo. Acepta variables {clave}. */
export function t(clave: ClaveUI, vars?: Record<string, string>): string {
  const paquete = ui[codigoActual] ?? ui[idiomaDefecto];
  let texto = paquete[clave] ?? ui[idiomaDefecto][clave];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      texto = texto.replace(`{${k}}`, v);
    }
  }
  return texto;
}

/** Cambia el idioma activo y notifica a todos los oyentes. */
export function setIdioma(codigo: string): void {
  if (!ui[codigo] || codigo === codigoActual) return;
  codigoActual = codigo;
  try {
    localStorage.setItem('idioma-ui', codigo);
  } catch {}
  oyentes.forEach((cb) => cb());
}

export function getIdioma(): string {
  return codigoActual;
}

/** Registra un callback que se llama cuando el idioma cambia. Devuelve una función para desregistrar. */
export function onCambioIdioma(cb: () => void): () => void {
  oyentes.push(cb);
  return () => {
    const i = oyentes.indexOf(cb);
    if (i >= 0) oyentes.splice(i, 1);
  };
}

/** Actualiza el textContent de todos los elementos con atributo [data-i18n]. */
export function aplicarTraduccionesDOM(): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const clave = el.getAttribute('data-i18n') as ClaveUI;
    el.textContent = t(clave);
  });
}
