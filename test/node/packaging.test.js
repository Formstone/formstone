/**
 * @fileoverview Packaging tests: run from a throwaway consumer project that links to this repo
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

let root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
let consumer;

before(() => {
  consumer = fs.mkdtempSync(path.join(os.tmpdir(), 'formstone-consumer-'));
  fs.mkdirSync(path.join(consumer, 'node_modules'));
  fs.symlinkSync(root, path.join(consumer, 'node_modules', 'formstone'), 'dir');
});

after(() => {
  fs.rmSync(consumer, { recursive: true, force: true });
});

/**
 * Runs a script inside the consumer project
 * @param {string} code - Script source
 * @param {Object} [options] - `cjs` for a CommonJS script, `args` for Node flags
 * @returns {{ stdout: string, stderr: string, status: number }} Result
 */
function run(code, { cjs = false, args = [] } = {}) {
  let file = path.join(consumer, cjs ? 'script.cjs' : 'script.mjs');

  fs.writeFileSync(file, code);

  return spawnSync(process.execPath, [...args, file], { cwd: consumer, encoding: 'utf8' });
}

test('M-P2: every export path resolves to a file that exists', () => {
  let expected = {
    'formstone': ['src/js/index.js', 'dist/formstone.js'],
    'formstone/lightbox': ['src/js/lightbox.js', 'src/js/lightbox.js'],
    'formstone/jquery': ['src/jquery/index.js', 'src/jquery/index.js'],
    'formstone/jquery/tabs': ['src/jquery/tabs.js', 'src/jquery/tabs.js'],
    'formstone/jquery/adaptor': ['src/jquery/adaptor.js', 'src/jquery/adaptor.js'],
    'formstone/lightbox.css': ['src/css/lightbox.css', 'src/css/lightbox.css'],
    'formstone/index.css': ['src/css/index.css', 'src/css/index.css'],
    'formstone/index.less': ['src/less/index.less', 'src/less/index.less'],
    'formstone/index.scss': ['src/scss/index.scss', 'src/scss/index.scss'],
    'formstone/dist/formstone.css': ['dist/formstone.css', 'dist/formstone.css'],
    'formstone/dist/formstone.jquery.js': ['dist/formstone.jquery.js', 'dist/formstone.jquery.js'],
    'formstone/package.json': ['package.json', 'package.json'],
  };

  let r = run(`
    import { createRequire } from 'node:module';
    import { fileURLToPath } from 'node:url';
    let require = createRequire(import.meta.url);
    let out = {};
    for (let s of ${JSON.stringify(Object.keys(expected))}) {
      out[s] = [fileURLToPath(import.meta.resolve(s)), require.resolve(s)];
    }
    console.log(JSON.stringify(out));
  `);

  assert.equal(r.status, 0, r.stderr);

  let resolved = JSON.parse(r.stdout);
  let real = fs.realpathSync(root) + path.sep;

  for (let [spec, [esm, cjs]] of Object.entries(expected)) {
    let [gotEsm, gotCjs] = resolved[spec].map((p) => fs.realpathSync(p).replace(real, ''));

    assert.equal(gotEsm, esm, `import ${spec}`);
    assert.equal(gotCjs, cjs, `require ${spec}`);
  }
});

test('M-P3, D7: import works in Node without a window and without warnings', () => {
  let r = run(`
    let m = await import('formstone');
    let c = await import('formstone/cookie');
    let j = await import('formstone/jquery');
    console.log(JSON.stringify({ exports: Object.keys(m).length, cookie: typeof c.default, install: typeof j.install }));
  `);

  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), { exports: 10, cookie: 'function', install: 'function' });
  assert.doesNotMatch(r.stderr, /Warning|MODULE_TYPELESS/);
});

test('D7: import works with ESM syntax detection off (older Node)', (t) => {
  let r = run(`
    let m = await import('formstone');
    console.log(Object.keys(m).length);
  `, { args: ['--no-experimental-detect-module'] });

  if (/bad option/.test(r.stderr)) {
    t.skip('flag not supported by this Node version');

    return;
  }

  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), '10');
});

test('D7: require() gets the CommonJS UMD bundles', () => {
  let r = run(`
    global.window = global;
    global.document = { dir: '' };
    let F = require('formstone');
    let J = require('formstone/dist/formstone.jquery.js');
    console.log(JSON.stringify({ exports: Object.keys(F).length, install: typeof J.install }));
  `, { cjs: true });

  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), { exports: 10, install: 'function' });
});

test('H11–H13: Sass pkg:formstone resolves and variables are configurable', () => {
  let r = run(`
    import * as sass from '${path.join(root, 'node_modules/sass/sass.node.mjs')}';
    let warnings = [];
    let options = {
      importers: [new sass.NodePackageImporter(process.cwd())],
      logger: { warn: (m) => warnings.push(m) },
      url: new URL('file://' + process.cwd() + '/x.scss'),
    };
    let index = sass.compileString("@use 'pkg:formstone' with ($fs-lightbox-duration: 1.5s);", options).css;
    let single = sass.compileString("@use 'pkg:formstone/lightbox.scss' with ($fs-lightbox-overlay-bg: red);", options).css;
    console.log(JSON.stringify({
      index: index.includes('--fs-lightbox-duration: 1.5s'),
      single: single.includes('--fs-lightbox-overlay-bg: red'),
      warnings: warnings.length,
    }));
  `);

  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), { index: true, single: true, warnings: 0 });
});

test('L-P2, D7: package metadata', () => {
  assert.equal(pkg.type, 'module');
  assert.ok(pkg.sideEffects.includes('./src/jquery/*.js'));
  assert.ok(pkg.sideEffects.includes('*.css'));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'dist/package.json'), 'utf8')), { type: 'commonjs' });
});
