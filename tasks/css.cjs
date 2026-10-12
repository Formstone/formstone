/**
 * @fileoverview CSS build tasks - prefixes and minifies with Lightning CSS, and tidies output
 *
 * Browser targets come from .browserslistrc. Lightning CSS adds vendor prefixes and flattens
 * modern syntax (e.g. nested @starting-style) where targets need it, so it replaces both
 * autoprefixer and clean-css.
 */

let browserslist = require('browserslist');
let { Transform } = require('stream');
let { browserslistToTargets, transform } = require('lightningcss');

/**
 * Gulp transform that prefixes and minifies CSS files
 * @returns {Transform} Object mode stream of Vinyl files
 */
function minify() {
  let targets = browserslistToTargets(browserslist(undefined, {
    path: process.cwd()
  }));

  return new Transform({
    objectMode: true,
    transform(file, enc, done) {
      try {
        let result = transform({
          filename: file.path,
          code: Buffer.from(file.contents),
          minify: true,
          targets
        });

        result.warnings.forEach((w) => {
          console.warn(`minify: ${w.message} (${file.basename}:${w.loc.line})`);
        });

        file.contents = Buffer.from(result.code);

        done(null, file);
      } catch (e) {
        done(e);
      }
    }
  });
}

/**
 * Gulp transform that removes empty lines
 * @returns {Transform} Object mode stream of Vinyl files
 */
function removeEmptyLines() {
  return new Transform({
    objectMode: true,
    transform(file, enc, done) {
      file.contents = Buffer.from(file.contents.toString().replace(/^\s*[\r\n]/gm, ''));

      done(null, file);
    }
  });
}

// Export

module.exports = {
  minify,
  removeEmptyLines
};
