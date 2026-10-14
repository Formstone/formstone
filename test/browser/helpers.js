/**
 * @fileoverview Shared helpers for browser specs
 *
 * Fixtures in test/fixtures/ run their scenario in the page and report back in one of three ways:
 * - `window.R`: a JSON string set when the scenario finishes
 * - `#out`: an element whose text becomes JSON when finished
 * - `window.T`: setup()/wide()/narrow() phases run across viewport widths; narrow() returns JSON
 */

import { expect } from '@playwright/test';

/**
 * Blocks requests that leave localhost, so fixtures never depend on the network
 * @param {import('@playwright/test').Page} page - Page
 * @returns {Promise<void>}
 */
export async function offline(page) {
  await page.route(/^https?:\/\/(?!localhost[:/])/, (route) => route.abort());
}

/**
 * Loads a fixture and returns its `window.R` result
 * @param {import('@playwright/test').Page} page - Page
 * @param {string} fixture - Fixture file name (and optional hash)
 * @returns {Promise<Object>} Result
 */
export async function result(page, fixture) {
  await offline(page);
  await page.goto(`/test/fixtures/${fixture}`);

  let handle = await page.waitForFunction(() => window.R);

  return JSON.parse(await handle.jsonValue());
}

/**
 * Loads a fixture and returns the JSON written to its `#out` element
 * @param {import('@playwright/test').Page} page - Page
 * @param {string} fixture - Fixture file name
 * @returns {Promise<Object>} Result
 */
export async function out(page, fixture) {
  await offline(page);
  await page.goto(`/test/fixtures/${fixture}`);
  await expect(page.locator('#out')).not.toHaveText('pending', { timeout: 15000 });

  return JSON.parse(await page.locator('#out').textContent());
}

/**
 * Runs a fixture's `window.T` phases: setup() at 500px, wide() at 1000px, narrow() back at 500px
 * @param {import('@playwright/test').Page} page - Page
 * @param {string} fixture - Fixture file name
 * @returns {Promise<Object>} Result returned by narrow()
 */
export async function phases(page, fixture) {
  await offline(page);
  await page.setViewportSize({ width: 500, height: 800 });
  await page.goto(`/test/fixtures/${fixture}`);
  await page.waitForFunction(() => window.T_READY === true);
  await page.evaluate(() => window.T.setup());
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.evaluate(() => window.T.wide());
  await page.setViewportSize({ width: 500, height: 800 });

  return JSON.parse(await page.evaluate(() => window.T.narrow()));
}

/**
 * Loads a fixture that exposes helpers and sets `window.T_READY`, for specs that drive input
 * @param {import('@playwright/test').Page} page - Page
 * @param {string} fixture - Fixture file name
 * @param {{ width: number, height: number }} [viewport] - Viewport size
 * @returns {Promise<void>}
 */
export async function ready(page, fixture, viewport = { width: 1000, height: 800 }) {
  await offline(page);
  await page.setViewportSize(viewport);
  await page.goto(`/test/fixtures/${fixture}`);
  await page.waitForFunction(() => window.T_READY === true);
}

/**
 * Dispatches a touch drag with Chromium's DevTools protocol (Playwright has no touch-drag API)
 * @param {import('@playwright/test').Page} page - Page
 * @param {number} x - Start x
 * @param {number} y - Start y
 * @param {number} dx - Horizontal distance
 * @returns {Promise<void>}
 */
export async function touchDrag(page, x, y, dx) {
  let cdp = await page.context().newCDPSession(page);

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });

  for (let i = 1; i <= 10; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / 10, y }] });
    await page.waitForTimeout(16);
  }

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(500);
}

/**
 * Dispatches a two-finger pinch with Chromium's DevTools protocol, symmetric around a point
 * @param {import('@playwright/test').Page} page - Page
 * @param {number} x - Center x
 * @param {number} y - Center y
 * @param {number} from - Starting distance between the fingers
 * @param {number} to - Ending distance between the fingers
 * @returns {Promise<void>}
 */
export async function touchPinch(page, x, y, from, to) {
  let cdp = await page.context().newCDPSession(page);
  let points = (d) => [{ x: x - d / 2, y, id: 0 }, { x: x + d / 2, y, id: 1 }];

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(from) });

  for (let i = 1; i <= 10; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(from + (to - from) * i / 10) });
    await page.waitForTimeout(16);
  }

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(400);
}

/**
 * Dispatches a touch tap with Chromium's DevTools protocol
 * @param {import('@playwright/test').Page} page - Page
 * @param {number} x - x
 * @param {number} y - y
 * @returns {Promise<void>}
 */
export async function touchTap(page, x, y) {
  let cdp = await page.context().newCDPSession(page);

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
