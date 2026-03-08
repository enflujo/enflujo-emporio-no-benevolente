import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { pathToFileURL } from 'node:url';
import process from 'node:process';
import ts from 'typescript';

const RUTA_TRADUCCIONES = path.join(process.cwd(), 'src', 'datos', 'traducciones.ts');
const RUTA_SALIDA_BASE = path.join(process.cwd(), 'estaticos', 'imagenes', 'busquedas-google');

const LOCALE_POR_IDIOMA = {
  en: { hl: 'en', gl: 'us' },
  ln: { hl: 'fr', gl: 'cd' },
  sw: { hl: 'sw', gl: 'tz' },
  rw: { hl: 'en', gl: 'rw' },
  kg: { hl: 'fr', gl: 'cd' },
  fr: { hl: 'fr', gl: 'be' },
  yo: { hl: 'yo', gl: 'ng' },
  ha: { hl: 'ha', gl: 'ng' },
  am: { hl: 'am', gl: 'et' },
  zu: { hl: 'zu', gl: 'za' },
  ar: { hl: 'ar', gl: 'eg' },
  hi: { hl: 'hi', gl: 'in' },
  qu: { hl: 'es', gl: 'pe' },
  gn: { hl: 'es', gl: 'py' },
  nah: { hl: 'es', gl: 'mx' },
  zh: { hl: 'zh-CN', gl: 'cn' },
  es: { hl: 'es', gl: 'es' },
  pt: { hl: 'pt', gl: 'br' },
};

const EXTENSIONES_VALIDAS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

function fechaHoyIso() {
  return new Date().toISOString().slice(0, 10);
}

function dormir(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsearLista(valor) {
  return valor
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsearArgumentos(argv) {
  const opciones = {
    proveedor: 'serpapi',
    version: fechaHoyIso(),
    limite: 6,
    categorias: null,
    idiomas: null,
    pausaMs: 700,
    sobrescribir: false,
    dryRun: false,
    originales: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--proveedor') opciones.proveedor = (argv[++i] ?? 'serpapi').toLowerCase();
    else if (arg === '--version') opciones.version = argv[++i];
    else if (arg === '--limite') opciones.limite = Number(argv[++i] ?? 6);
    else if (arg === '--categorias') opciones.categorias = parsearLista(argv[++i] ?? '');
    else if (arg === '--idiomas') opciones.idiomas = parsearLista(argv[++i] ?? '');
    else if (arg === '--pausa-ms') opciones.pausaMs = Number(argv[++i] ?? 700);
    else if (arg === '--sobrescribir') opciones.sobrescribir = true;
    else if (arg === '--dry-run') opciones.dryRun = true;
    else if (arg === '--originales') opciones.originales = true;
    else if (arg === '--help') opciones.help = true;
    else throw new Error(`Argumento no reconocido: ${arg}`);
  }

  if (!Number.isFinite(opciones.limite) || opciones.limite <= 0) {
    throw new Error('El argumento --limite debe ser un numero mayor a 0.');
  }

  if (!Number.isFinite(opciones.pausaMs) || opciones.pausaMs < 0) {
    throw new Error('El argumento --pausa-ms debe ser un numero mayor o igual a 0.');
  }

  if (!['serpapi', 'serper'].includes(opciones.proveedor)) {
    throw new Error('El argumento --proveedor debe ser "serpapi" o "serper".');
  }

  return opciones;
}

function imprimirAyuda() {
  console.log(`
Uso:
  node scripts/descargarBusquedasGoogle.js [opciones]

Opciones:
  --proveedor nombre      "serpapi" (default) o "serper"
  --version YYYY-MM-DD   Carpeta de salida por version (default: hoy)
  --limite N             Numero de imagenes por consulta (default: 6)
  --categorias a,b,c     Filtrar categorias COCO por nombre exacto
  --idiomas en,es,ln     Filtrar idiomas (incluye "en" para el termino original)
  --pausa-ms N           Pausa entre consultas para evitar bloqueo (default: 700)
  --sobrescribir         Reprocesa consultas aunque ya exista meta.json
  --dry-run              No llama APIs ni descarga archivos
  --originales           Prioriza URL original (por defecto usa thumbnail)
  --help                 Muestra esta ayuda

Requisito:
  --proveedor serpapi -> requiere SERPAPI_KEY
  --proveedor serper  -> requiere SERPER_API_KEY
`);
}

function slugSeguro(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extensionDesdeUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if (EXTENSIONES_VALIDAS.has(ext)) return ext;
  } catch {
    return '.jpg';
  }
  return '.jpg';
}

async function existeArchivo(ruta) {
  try {
    await fs.access(ruta);
    return true;
  } catch {
    return false;
  }
}

async function descargarArchivo(url, destino) {
  const respuesta = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
  });

  if (!respuesta.ok || !respuesta.body) {
    throw new Error(`No se pudo descargar ${url} (${respuesta.status})`);
  }

  await fs.mkdir(path.dirname(destino), { recursive: true });
  await pipeline(Readable.fromWeb(respuesta.body), createWriteStream(destino));
}

async function cargarTraducciones() {
  const fuente = await fs.readFile(RUTA_TRADUCCIONES, 'utf8');
  const transpile = ts.transpileModule(fuente, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2022,
    },
  });

  const archivoTemporal = path.join(
    os.tmpdir(),
    `emporio-traducciones-${Date.now()}-${Math.random().toString(16).slice(2)}.mjs`
  );
  await fs.writeFile(archivoTemporal, transpile.outputText, 'utf8');

  try {
    const modulo = await import(pathToFileURL(archivoTemporal).href);
    return {
      idiomas: modulo.idiomas ?? {},
      traducciones: modulo.traducciones ?? {},
    };
  } finally {
    await fs.unlink(archivoTemporal).catch(() => {});
  }
}

async function consultarGoogleImagenes({ apiKey, termino, idioma, limite }) {
  const locale = LOCALE_POR_IDIOMA[idioma] ?? LOCALE_POR_IDIOMA.en;
  const query = new URLSearchParams({
    engine: 'google_images',
    q: termino,
    hl: locale.hl,
    gl: locale.gl,
    ijn: '0',
    num: String(limite),
    safe: 'off',
    api_key: apiKey,
  });

  const respuesta = await fetch(`https://serpapi.com/search.json?${query.toString()}`);
  if (!respuesta.ok) {
    throw new Error(`Error SerpAPI ${respuesta.status}: ${await respuesta.text()}`);
  }

  const data = await respuesta.json();
  const resultados = Array.isArray(data.images_results) ? data.images_results.slice(0, limite) : [];

  return {
    locale,
    resultados,
  };
}

async function consultarGoogleImagenesSerper({ apiKey, termino, idioma, limite }) {
  const locale = LOCALE_POR_IDIOMA[idioma] ?? LOCALE_POR_IDIOMA.en;
  const respuesta = await fetch('https://google.serper.dev/images', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: termino,
      gl: locale.gl,
      hl: locale.hl,
      num: limite,
      page: 1,
    }),
  });

  if (!respuesta.ok) {
    throw new Error(`Error Serper ${respuesta.status}: ${await respuesta.text()}`);
  }

  const data = await respuesta.json();
  const lista =
    (Array.isArray(data.images) && data.images) || (Array.isArray(data.images_results) && data.images_results) || [];

  return {
    locale,
    resultados: lista.slice(0, limite),
  };
}

function construirConsulta({ categoria, idioma, idiomasDisponibles, traduccionesCategoria }) {
  if (idioma === 'en') {
    return { termino: categoria, nombreIdioma: 'English' };
  }

  const termino = traduccionesCategoria[idioma];
  if (!termino) return null;
  return { termino, nombreIdioma: idiomasDisponibles[idioma] ?? idioma };
}

async function main() {
  const opciones = parsearArgumentos(process.argv.slice(2));
  if (opciones.help) {
    imprimirAyuda();
    return;
  }

  const { idiomas, traducciones } = await cargarTraducciones();
  const categoriasDisponibles = Object.keys(traducciones);
  const idiomasDisponibles = { en: 'English', ...idiomas };

  const categoriasObjetivo = opciones.categorias ?? categoriasDisponibles;
  const idiomasObjetivo = opciones.idiomas ?? Object.keys(idiomasDisponibles);

  const categoriasInvalidas = categoriasObjetivo.filter((c) => !categoriasDisponibles.includes(c));
  if (categoriasInvalidas.length > 0) {
    throw new Error(`Categorias no encontradas: ${categoriasInvalidas.join(', ')}`);
  }

  const idiomasInvalidos = idiomasObjetivo.filter((c) => !Object.keys(idiomasDisponibles).includes(c));
  if (idiomasInvalidos.length > 0) {
    throw new Error(`Idiomas no encontrados: ${idiomasInvalidos.join(', ')}`);
  }

  const variableApiKey = opciones.proveedor === 'serper' ? 'SERPER_API_KEY' : 'SERPAPI_KEY';
  const apiKey = process.env[variableApiKey] ?? '';
  if (!opciones.dryRun && !apiKey) {
    throw new Error(`Falta ${variableApiKey} en el entorno. Usa --dry-run para solo validar.`);
  }

  const plan = [];
  categoriasObjetivo.forEach((categoria) => {
    const traduccionesCategoria = traducciones[categoria] ?? {};
    idiomasObjetivo.forEach((idioma) => {
      const consulta = construirConsulta({
        categoria,
        idioma,
        idiomasDisponibles,
        traduccionesCategoria,
      });
      if (!consulta) return;
      plan.push({
        categoria,
        idioma,
        nombreIdioma: consulta.nombreIdioma,
        termino: consulta.termino,
      });
    });
  });

  if (plan.length === 0) {
    throw new Error('No hay consultas para ejecutar con los filtros actuales.');
  }

  const carpetaVersion = path.join(RUTA_SALIDA_BASE, opciones.version);
  if (!opciones.dryRun) {
    await fs.mkdir(carpetaVersion, { recursive: true });
  }

  const indice = {
    version: opciones.version,
    generadoEn: new Date().toISOString(),
    limite: opciones.limite,
    originales: opciones.originales,
    totalConsultas: plan.length,
    consultas: [],
  };

  let completadas = 0;
  let omitidas = 0;
  let errores = 0;

  for (let i = 0; i < plan.length; i += 1) {
    const item = plan[i];
    const categoriaSlug = slugSeguro(item.categoria);
    const carpetaConsulta = path.join(carpetaVersion, categoriaSlug, item.idioma);
    const rutaMeta = path.join(carpetaConsulta, 'meta.json');
    const progreso = `[${i + 1}/${plan.length}] ${item.categoria} · ${item.idioma} · "${item.termino}"`;

    if (!opciones.sobrescribir && (await existeArchivo(rutaMeta))) {
      console.log(`${progreso} -> omitida (ya existe)`);
      omitidas += 1;
      continue;
    }

    if (opciones.dryRun) {
      console.log(`${progreso} -> dry-run`);
      completadas += 1;
      continue;
    }

    try {
      const respuestaProveedor =
        opciones.proveedor === 'serper'
          ? await consultarGoogleImagenesSerper({
              apiKey,
              termino: item.termino,
              idioma: item.idioma,
              limite: opciones.limite,
            })
          : await consultarGoogleImagenes({
              apiKey,
              termino: item.termino,
              idioma: item.idioma,
              limite: opciones.limite,
            });
      const resultadosFinal = respuestaProveedor.resultados;
      const localeFinal = respuestaProveedor.locale;

      await fs.mkdir(carpetaConsulta, { recursive: true });

      const meta = {
        categoria: item.categoria,
        categoriaSlug,
        idioma: item.idioma,
        nombreIdioma: item.nombreIdioma,
        termino: item.termino,
        version: opciones.version,
        fecha: new Date().toISOString(),
        proveedor: opciones.proveedor,
        locale: localeFinal,
        googleUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(item.termino)}&hl=${localeFinal.hl}&gl=${localeFinal.gl}`,
        imagenes: [],
      };

      for (let j = 0; j < resultadosFinal.length; j += 1) {
        const resultado = resultadosFinal[j];
        const urlThumbnail = resultado.thumbnail ?? resultado.thumbnailUrl ?? resultado.imageUrl;
        const urlOriginal = resultado.original ?? resultado.originalUrl ?? resultado.imageUrl ?? resultado.link;
        const urlPreferida = opciones.originales ? (urlOriginal ?? urlThumbnail) : (urlThumbnail ?? urlOriginal);

        if (!urlPreferida) {
          meta.imagenes.push({
            orden: j + 1,
            error: 'Resultado sin URL de imagen',
          });
          continue;
        }

        const extension = extensionDesdeUrl(urlPreferida);
        const nombreArchivo = `${String(j + 1).padStart(2, '0')}${extension}`;
        const rutaArchivo = path.join(carpetaConsulta, nombreArchivo);

        try {
          await descargarArchivo(urlPreferida, rutaArchivo);
          meta.imagenes.push({
            orden: j + 1,
            rutaLocal: path.relative(process.cwd(), rutaArchivo).replaceAll('\\', '/'),
            fuenteImagen: urlPreferida,
            fuentePagina: resultado.link ?? resultado.source ?? null,
            titulo: resultado.title ?? null,
            miniatura: urlThumbnail ?? null,
            original: urlOriginal ?? null,
          });
        } catch (error) {
          meta.imagenes.push({
            orden: j + 1,
            fuenteImagen: urlPreferida,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      await fs.writeFile(rutaMeta, JSON.stringify(meta, null, 2), 'utf8');
      indice.consultas.push({
        categoria: item.categoria,
        categoriaSlug,
        idioma: item.idioma,
        nombreIdioma: item.nombreIdioma,
        termino: item.termino,
        rutaMeta: path.relative(process.cwd(), rutaMeta).replaceAll('\\', '/'),
        totalResultados: resultadosFinal.length,
      });

      completadas += 1;
      console.log(`${progreso} -> ${resultadosFinal.length} resultados`);
    } catch (error) {
      errores += 1;
      console.log(`${progreso} -> error: ${error instanceof Error ? error.message : String(error)}`);
    }

    await dormir(opciones.pausaMs);
  }

  indice.resumen = { completadas, omitidas, errores };
  console.log('\nResumen');
  console.log(`- version: ${opciones.version}`);
  console.log(`- consultas totales: ${plan.length}`);
  console.log(`- completadas: ${completadas}`);
  console.log(`- omitidas: ${omitidas}`);
  console.log(`- errores: ${errores}`);
  if (!opciones.dryRun) {
    const rutaIndice = path.join(carpetaVersion, 'indice.json');
    await fs.writeFile(rutaIndice, JSON.stringify(indice, null, 2), 'utf8');
    console.log(`- indice: ${path.relative(process.cwd(), rutaIndice).replaceAll('\\', '/')}`);
  } else {
    console.log('- indice: no se escribe en modo dry-run');
  }

  if (errores > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
