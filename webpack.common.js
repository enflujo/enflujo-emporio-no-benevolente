const HtmlWebPackPlugin = require('html-webpack-plugin');
const path = require('path');
const titulo = 'Emporio no Benevolente';
const descripcion = `Aplicación para detectar 'objetos' (según el lenguaje de modelos como Coco SSD, el cual incluye humanos) en películas grabadas durante la colonia Belga en África.`;
const url = 'https://enflujo.com/emporio/';
const ogImg = `${url}imgs/emporio-no-benevolente_v1.jpg`;

module.exports = {
  entry: {
    programa: './src/index.js',
  },
  output: {
    publicPath: '/',
    filename: '[name].[fullhash].js',
    chunkFilename: '[name].[fullhash].js',
    path: path.resolve(__dirname, 'publico'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
      meta: {
        description: { name: 'description', content: descripcion },

        'og:type': { property: 'og:type', content: 'website' },
        'og:url': { property: 'og:url', content: url },
        'og:title': { property: 'og:title', content: titulo },
        'og:description': { property: 'og:description', content: descripcion },
        'og:image': { property: 'og:image', content: ogImg },

        'twitter:card': { name: 'twitter:card', content: 'summary_large_image' },
        'twitter:site': { name: 'twitter:site', content: '@labenflujo' },
        'twitter:url': { name: 'twitter:url', content: url },
        'twitter:title': { name: 'twitter:title', content: titulo },
        'twitter:description': { name: 'twitter:description', content: descripcion },
        'twitter:image': { name: 'twitter:image', content: ogImg },
        'twitter:image:alt': { name: 'twitter:image:alt', content: titulo },
      },
    }),
  ],
};
