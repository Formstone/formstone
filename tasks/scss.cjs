/**
 * @fileoverview SCSS build tasks - generates SCSS from the compiled Less output and verifies it
 *
 * No Less syntax is translated. Each module is compiled with lessc, then:
 * - every `@fs-*` Less variable becomes `$fs-*: <evaluated value> !default;`
 * - the root custom property (`--fs-*`) or `@media` query that used it references the Sass variable
 * - `index.less` becomes `@forward` rules, so variables are configurable through the index
 *
 * Any other use of a Less variable throws, rather than producing SCSS that silently differs.
 */

let fs = require('fs');
let path = require('path');
let less = require('less');
let sass = require('sass');
let { Transform } = require('stream');

// Convert

/**
 * Converts the index Less source to Sass module forwards
 * @param {string} source - index.less source
 * @returns {string} SCSS source
 */
function convertIndex(source) {
  return source.replace(/@import\s+(['"])([\w-]+)\.less\1;/g, '@forward \'$2\';');
}

/**
 * Converts a module Less source to SCSS
 * @param {string} source - Less source
 * @param {string} filename - Less file path
 * @returns {Promise<string>} SCSS source
 */
async function convertModule(source, filename) {
  let name = path.basename(filename);
  let { css } = await less.render(source, { filename });
  let scss = css;

  // Variables

  let vars = [...source.matchAll(/^@(fs-[\w-]+)\s*:\s*([^;]+);/gm)].map(([, v, raw]) => {
    let prop = css.match(new RegExp(`(?<![\\w-])--${v}:\\s*([^;{}]+);`));
    let value = prop ? prop[1].trim() : raw.trim();

    if (!prop && /[@(~]/.test(value)) {
      throw new Error(`convert-scss: can't evaluate @${v} in ${name}`);
    }

    // Root custom property declaration only; later redefinitions (e.g. reduced motion) are kept
    if (prop) {
      scss = scss.replace(prop[0], `--${v}: #{$${v}};`);
    }

    return { name: v, value };
  });

  let lookup = (v) => {
    let match = vars.find((item) => item.name === v);

    if (!match) {
      throw new Error(`convert-scss: unknown variable @${v} in ${name}`);
    }

    return match.value;
  };

  // Media Queries

  for (let [, prelude] of source.matchAll(/@media([^{]*@fs-[^{]*)\{/g)) {
    let evaluated = `@media ${prelude.replace(/@(fs-[\w-]+)/g, (m, v) => lookup(v)).trim()}`;
    let replaced = `@media ${prelude.replace(/@(fs-[\w-]+)/g, '$$$1').trim()}`;

    if (!scss.includes(evaluated)) {
      throw new Error(`convert-scss: can't find "${evaluated}" in ${name} output`);
    }

    scss = scss.split(evaluated).join(replaced);
  }

  // Unsupported Usage

  let unsupported = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/^@fs-[\w-]+\s*:[^;]+;/gm, '')
    .replace(/--fs-[\w-]+\s*:\s*@fs-[\w-]+;/g, '')
    .replace(/@media[^{]*\{/g, '')
    .match(/@fs-[\w-]+/g);

  if (unsupported) {
    throw new Error(`convert-scss: unsupported variable usage in ${name}: ${unsupported.join(', ')}`);
  }

  let declarations = vars.map(({ name: v, value }) => `$${v}: ${value} !default;`).join('\n');

  return `// Variables\n\n${declarations}\n\n${scss}`;
}

/**
 * Gulp transform that converts Less files to SCSS
 * @returns {Transform} Object mode stream of Vinyl files
 */
function convert() {
  return new Transform({
    objectMode: true,
    transform(file, enc, done) {
      let source = file.contents.toString();
      let converted = (file.stem === 'index') ? Promise.resolve(convertIndex(source)) : convertModule(source, file.path);

      converted.then((contents) => {
        file.contents = Buffer.from(contents);
        file.extname = '.scss';
        done(null, file);
      }, done);
    }
  });
}

// Verify

/**
 * Normalizes CSS for comparison
 * Re-serializes through Sass so both sides share nesting, quote and attribute formatting
 * (e.g. Less keeps nested at-rules like @starting-style nested; Sass bubbles them), then
 * removes comments and whitespace
 * @param {string} css - CSS source
 * @returns {string} Normalized CSS
 */
function normalizeCss(css) {
  return sass.compileString(css, { style: 'compressed' }).css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, '');
}

/**
 * Verifies generated SCSS against its Less source
 * Fails unless every module and the index compile without warnings to the same CSS as Less,
 * and every used variable can be configured with `@use ... with ()`, directly and through the index
 * @param {string} lessDir - Less source directory
 * @param {string} scssDir - Generated SCSS directory
 * @returns {Promise<void>}
 */
async function verify(lessDir, scssDir) {
  let errors = [];
  let warnings = [];
  let options = {
    loadPaths: [scssDir],
    logger: {
      warn: (message) => {
        warnings.push(message.split('\n')[0]);
      }
    }
  };

  let compile = (label, scss) => {
    try {
      return sass.compileString(scss, options).css;
    } catch (e) {
      errors.push(`${label} doesn't compile: ${e.message.split('\n')[0]}`);
      return null;
    }
  };

  let lessCss = async (file) => {
    let filename = path.join(lessDir, file);

    return (await less.render(fs.readFileSync(filename, 'utf8'), { filename })).css;
  };

  let modules = fs.readdirSync(lessDir).filter((f) => f.endsWith('.less') && f !== 'index.less');
  let allVars = [];

  for (let file of modules) {
    let name = path.basename(file, '.less');
    let lessSource = fs.readFileSync(path.join(lessDir, file), 'utf8');
    let compiled = compile(`${name}.scss`, `@use '${name}';`);

    if (compiled === null) {
      continue;
    }

    if (normalizeCss(compiled) !== normalizeCss(await lessCss(file))) {
      errors.push(`${name}.scss output differs from ${file}`);
    }

    // Variables the Less source declares but never uses are skipped
    let vars = [...fs.readFileSync(path.join(scssDir, `${name}.scss`), 'utf8').matchAll(/^\$(fs-[\w-]+):.*!default;/gm)]
      .map((m) => m[1])
      .filter((v) => lessSource.split(`@${v}`).length > 2);

    if (!vars.length && /^@fs-/m.test(lessSource)) {
      errors.push(`${name}.scss has no configurable (!default) variables`);
    }

    for (let v of vars) {
      if (!(compile(`${name}.scss with $${v}`, `@use '${name}' with ($${v}: 12345px);`) || '').includes('12345px')) {
        errors.push(`${name}.scss: $${v} can't be configured`);
      }
    }

    allVars.push(...vars);
  }

  // Index

  let index = compile('index.scss', `@use 'index';`);

  if (index !== null && normalizeCss(index) !== normalizeCss(await lessCss('index.less'))) {
    errors.push('index.scss output differs from index.less');
  }

  for (let v of allVars) {
    if (!(compile(`index.scss with $${v}`, `@use 'index' with ($${v}: 12345px);`) || '').includes('12345px')) {
      errors.push(`index.scss: $${v} can't be configured through the index`);
    }
  }

  // Deprecations

  for (let w of new Set(warnings)) {
    errors.push(`Sass warning: ${w}`);
  }

  if (errors.length) {
    throw new Error(`verify-scss:\n  ${errors.join('\n  ')}`);
  }
}

// Export

module.exports = {
  convert,
  verify
};
