/**
 * @fileoverview Unit tests for DOM-free helpers in src/js/utils.js
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { camelCase, extend, falsey, isFn, isObj, isU } from '../../src/js/utils.js';

test('H9: deep extend merges at any depth', () => {
  let r = extend(true, { vp: { youtube: { url: 'a', opts: 1 } } }, { vp: { youtube: { url: 'b' } } });

  assert.deepEqual(r, { vp: { youtube: { url: 'b', opts: 1 } } });
});

test('H9: deep extend copies nested objects instead of sharing them', () => {
  let base = { a: { b: { c: 1 } } };
  let copy = extend(true, base, {});

  copy.a.b.c = 2;

  assert.equal(base.a.b.c, 1);
});

test('H9: deep extend keeps non-plain values by reference and replaces arrays', () => {
  let re = /x/;
  let arr = [1, 2];
  let fn = () => {};
  let r = extend(true, { re: /y/, arr: [9, 9, 9], fn: null }, { re, arr, fn });

  assert.equal(r.re, re);
  assert.equal(r.arr, arr);
  assert.equal(r.fn, fn);
});

test('H9: shallow extend shares nested objects', () => {
  let inner = { y: 1 };

  assert.equal(extend({ x: { z: 1 } }, { x: inner }).x, inner);
});

test('H9: extend ignores __proto__ keys', () => {
  let evil = JSON.parse('{"__proto__": {"polluted": true}, "nested": {"__proto__": {"polluted": true}}}');
  let r = extend(true, {}, evil);

  assert.equal(r.polluted, undefined);
  assert.equal(r.nested.polluted, undefined);
  assert.equal(Object.getPrototypeOf(r), Object.prototype);
  assert.equal({}.polluted, undefined);
});

test('extend skips null and undefined arguments', () => {
  assert.deepEqual(extend(true, { a: 1 }, null, undefined, { b: 2 }), { a: 1, b: 2 });
});

test('L-U1: type checks', () => {
  assert.equal(isObj(null), false);
  assert.equal(isObj({}), true);
  assert.equal(isFn(() => {}), true);
  assert.equal(isU(undefined), true);
  assert.equal(falsey(0), false);
  assert.equal(falsey(null), true);
  assert.equal(falsey(false), true);
});

test('camelCase', () => {
  assert.equal(camelCase('my-data-attr'), 'myDataAttr');
  assert.equal(camelCase('background color'), 'backgroundColor');
});
