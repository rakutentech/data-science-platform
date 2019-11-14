const merge = require('webpack-merge'),
  common = require('./webpack.config.js'),
  server = require('./server'),
  plugins = require('./plugins');

module.exports = () => merge(common, {
  mode: 'production',
  devServer: server.prod,
  plugins: plugins.prod,
  externals: {
    // global app config object
    config: JSON.stringify({
      apiUrl: '<Domain>/launchpad-api',
      gateway: '<Domain>'
    })
  }
});
