// ---------------------
// @Loading Dependencies
// ---------------------

const manifest = require('./manifest');

// ------------------
// @DevServer Configs
// ------------------

/**
 * [1] : To enable local network testing
 */

const dev = {
  contentBase: manifest.paths.src,
  historyApiFallback: true,
  port: 3000,
  compress: false,
  inline: true,
  watchContentBase: true,
  hot: true,
  host: 'localhost',
  disableHostCheck: true, // [1]
  overlay: true,
  stats: {
    assets: true,
    children: false,
    chunks: false,
    hash: false,
    modules: false,
    publicPath: false,
    timings: true,
    version: false,
    warnings: true,
    colors: true
  },
  proxy: {
    '/api/**': {
      target: 'http://localhost:3001',
      secure: false,
      logLevel: 'debug'
    }
  }
};

const prod = {
  contentBase: manifest.paths.dist,
  historyApiFallback: true,
  compress: true,
  inline: false,
  watchContentBase: true,
  hot: false,
  host: '0.0.0.0',
  disableHostCheck: true, // [1]
  overlay: true,
  stats: {
    assets: true,
    children: false,
    chunks: false,
    hash: false,
    modules: false,
    publicPath: false,
    timings: true,
    version: false,
    warnings: true,
    colors: true
  }
};

const devServer = {
  dev: dev,
  prod: prod
};

// -----------------
// @Exporting Module
// -----------------

module.exports = devServer;
