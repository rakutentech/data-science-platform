module.exports = {
  test    : /\.(png|gif|jpg)$/i,
  exclude: function(modulePath) {
    return /node_modules/.test(modulePath) &&
          !(
            /node_modules\/jquery-ui-bundle/.test(modulePath) ||
            /node_modules\/datatables/.test(modulePath)
          );
  },
  use     : [{
    loader: 'file-loader',
    options: {
      outputPath: 'assets',
      publicPath: '/assets',
    },
  }],
};