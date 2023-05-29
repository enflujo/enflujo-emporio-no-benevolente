const { readdir, writeFileSync } = require('fs');
const { extname } = require('path');
const formatos = ['mp4', 'webm', 'ogv'];
const videos = [];

readdir('estaticos/videos', (err, archivos) => {
  if (err) throw new Error(err);

  archivos.forEach((nombre) => {
    const formato = extname(nombre).slice(1);
    const esVideo = formatos.includes(formato);

    if (esVideo) {
      videos.push({ nombre, formato });
    }
  });

  writeFileSync('./estaticos/listaVideos.json', JSON.stringify(videos));
  console.log('Lista de videos creada!');
});
