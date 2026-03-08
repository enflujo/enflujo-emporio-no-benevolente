# Imagenes por categoria

Guardar aqui las capturas por categoria detectada.

## Estructura sugerida

```text
estaticos/imagenes/
  person/
    google-person-01.jpg
    google-person-02.jpg
  bicycle/
    google-bicycle-01.jpg
```

Luego registrar cada archivo en `src/datos/imagenes.ts` con su `ruta`, `alt` y metadatos opcionales (`fuente`, `nota`).

## Descarga automatizada (Google Images via API)

Se puede generar un lote completo por version (fecha) recorriendo:

- 80 categorias COCO
- ingles (`en`) + 17 lenguas del proyecto

Comando:

```bash
SERPER_API_KEY=tu_api_key yarn descargar-busquedas --proveedor serper --version 2026-03-08 --limite 6
```

Salida:

```text
estaticos/imagenes/busquedas-google/2026-03-08/
  indice.json
  person/
    en/meta.json
    es/meta.json
    ln/meta.json
```

Cada `meta.json` incluye termino, locale usado (`hl`, `gl`), URLs fuente y rutas locales descargadas.

Tambien soporta `--proveedor serpapi` (requiere `SERPAPI_KEY`).
