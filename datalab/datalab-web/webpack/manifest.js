// ------------------
// @Table of Contents
// ------------------

/**
 * + @Loading Dependencies
 * + @Environment Holders
 * + @Utils
 * + @App Paths
 * + @Output Files Names
 * + @Entries Files Names
 * + @Exporting Module
 */


// ---------------------
// @Loading Dependencies
// ---------------------

const path = require('path');

// ------
// @Utils
// ------

/* eslint no-undef: 0 */
const
  dir = src => path.join(__dirname, src);


// ----------
// @App Paths
// ----------

const
  paths = {
    src   : dir('../src'),
    dist : dir('../dist'),
  };

// -----------------
// @Exporting Module
// -----------------

module.exports = {
  paths
};