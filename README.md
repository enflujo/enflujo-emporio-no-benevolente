# Emporio no benevolente

![Tamaño](https://img.shields.io/github/repo-size/enflujo/enflujo-emporio-no-benevolente?color=%235757f7&label=Tama%C3%B1o%20repo&logo=open-access&logoColor=white)
![Licencia](https://img.shields.io/github/license/enflujo/enflujo-emporio-no-benevolente?label=Licencia&logo=open-source-initiative&logoColor=white)

Aplicación para detectar "objetos" _(según el lenguaje de modelos como Coco SSD, el cual incluye humanos)_ en películas grabadas durante la colonia Belga en África. El archivo contiene imágenes filmadas en África y también en la cotidianidad de vuelta en casa de los mismos camarógrafos.

## Desarrollo

Descargar este repositorio localmente:

```bash
git clone https://github.com/enflujo/enflujo-emporio-no-benevolente.git
```

Instalar dependencias:

```bash
yarn
```

Iniciar servidor local en http://localhost:8080

```bash
yarn start
```

### Generar lista de videos

La lista de videos se genera automáticamente según los archivos de video que se guarden dentro de `/publico/videos`.

Para generar una lista nueva:

```bash
yarn crear-lista
```

## Exportar y finalizar

Para crear el sitio en HTML estático:

```bash
yarn build
```

Esto exporta todos los archivos que se deben subir a un servidor dentro de la carpeta `/publico`.
