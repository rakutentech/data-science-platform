const merge = require('webpack-merge'),
  common = require('./webpack.common.js'),
  devServer = require('./devServer'),
  plugins = require('./plugins');


module.exports = env => merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: devServer.dev,
  plugins: plugins.dev,
  externals: {
    // global app config object
    config: JSON.stringify({
      apiUrl: 'http://localhost:3001/api/v1',
      adminPath: '/admin',
      fakeBackend: (env && env.FAKE_BACKEND) || false
    })
  }
});
