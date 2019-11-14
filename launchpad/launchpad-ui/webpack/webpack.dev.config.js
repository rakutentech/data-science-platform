const merge = require('webpack-merge'),
  common = require('./webpack.config.js'),
  server = require('./server'),
  plugins = require('./plugins');


module.exports = () => merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: server.dev,
  plugins: plugins.dev,
  externals: {
    // global app config object
    config: JSON.stringify({
      apiUrl: '<Domain>/launchpad-api',
      gateway: '<Domain>',
      adminPath: '/admin'
    })
  }
});
