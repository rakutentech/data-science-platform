const merge = require('webpack-merge'),
  common = require('./webpack.common.js'),
  devServer = require('./devServer'),
  plugins = require('./plugins');

module.exports = env => merge(common, {
  mode: 'production',
  devServer: devServer.prod,
  plugins: plugins.prod,
  externals: {
    // global app config object
    config: JSON.stringify({
      apiUrl: '/api/v1',
      adminPath: '/admin',
    })
  }
});
