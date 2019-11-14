module.exports = {
  test: /\.(eot|svg|ttf|woff|woff2)$/,
  exclude : /(node_modules)/,
  use     : [{
    loader: 'file-loader',
    options: {
      outputPath: 'assets/static/fonts',
    },
  }],
};