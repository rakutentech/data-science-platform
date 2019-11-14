// ------------------
// @Table of Contents
// ------------------

/**
 * + @Loading Dependencies
 * + @Common Loaders
 * + @Merging Production Loaders
 * + @Merging Development Loaders
 * + @Exporting Module
 */


// ---------------------
// @Loading Dependencies
// ---------------------

const
  ExtractTextPlugin = require('extract-text-webpack-plugin');


// ---------------
// @Common Loaders
// ---------------

let rule;

const loaders = [
  {
    loader: 'css-loader'
  },
];


// ---------------------------
// @Merging Production Loaders
// ---------------------------

rule = {
  test: /\.css$/,
  loader: ExtractTextPlugin.extract({
    use: loaders,
  }),
};



// -----------------
// @Exporting Module
// -----------------

module.exports = rule;
