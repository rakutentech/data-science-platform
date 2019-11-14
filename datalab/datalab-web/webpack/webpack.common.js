
const
  path      = require('path'),
  manifest  = require('./manifest'),
  rules     = require('./rules');


module.exports = {
  entry: {
    datalab: path.join(manifest.paths.src, '/datalab-app.js')
  },
  output: {
    path: path.resolve(manifest.paths.dist),
    filename: '[name]-bundle.js'
  },
  module: {
    rules
  },
  optimization: {
    namedChunks: true,
    splitChunks: {
      automaticNameDelimiter: '-',
      cacheGroups: {
        vendors: false
      }
    }
  }
};
