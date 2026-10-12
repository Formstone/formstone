/**
 * @fileoverview JS build tasks - bundles UMD builds with webpack
 */

let path = require('path');
let webpack = require('webpack');

/**
 * Creates a gulp task that bundles an entry module into a UMD build in dist/
 * Uses `NODE_ENV` for the webpack mode (production unless set)
 * @param {Object} options - Bundle options
 * @param {string} options.entry - Entry module path
 * @param {string} options.filename - Output file name
 * @param {Object} [options.externals] - webpack externals
 * @returns {Function} Gulp task
 */
function bundle({ entry, filename, externals }) {
  return (done) => {
    webpack({
      mode: process.env.NODE_ENV || 'production',
      entry,
      externals,
      output: {
        path: path.resolve('dist'),
        filename,
        globalObject: 'window',
        library: {
          name: 'Formstone',
          type: 'umd'
        }
      }
    }, (err, stats) => {
      if (!err && stats.hasErrors()) {
        err = new Error(stats.toString('errors-only'));
      }

      done(err);
    });
  };
}

// Export

module.exports = {
  bundle
};
