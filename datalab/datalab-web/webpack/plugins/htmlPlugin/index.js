const
  path = require('path'),
  manifest = require('../../manifest'),
  HtmlWebpackPlugin = require('html-webpack-plugin');

/*
Multiple html files for splitting bundle.js into admin and datalab
*/

const htmls = [
  new HtmlWebpackPlugin({
    template: path.join(manifest.paths.src, '/index.html'),
    path: manifest.paths.dist,
    chunks: ['datalab'],
    filename: 'index.html',
    minify: {
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      useShortDoctype: true,
    }
  })
]

module.exports = htmls;