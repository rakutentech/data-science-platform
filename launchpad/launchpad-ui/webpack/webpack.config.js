const
  path      = require('path'),
  manifest  = require('./manifest'),
  rules     = require('./rules');

module.exports = {
  entry: {
    launchpad: path.join(manifest.paths.src, '/index.js')
  },
  output: {
    path: path.resolve(manifest.paths.dist),
    filename: '[name]-bundle[hash:8].js',
    // publicPath: '../dist/'
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
