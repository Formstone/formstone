/**
 * @fileoverview Runs every docs demo (docs/<page>/default.md js-editor figures) in the docs-demo
 * harness, which mirrors the docs site's CodePen embeds, and fails on JavaScript errors.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { offline } from './helpers.js';

let docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../docs');

/**
 * Optional checks that a demo actually works, keyed by `page › title`
 * @type {Object<string, (page: import('@playwright/test').Page) => Promise<void>>}
 */
let interactions = {
  'lightbox › Basic': async (page) => {
    await page.locator('.js-lightbox').first().click();
    await expect(page.locator('dialog.fs-lightbox')).toHaveAttribute('open', '');
    await expect(page.locator('.fs-lightbox-caption')).toHaveText('Ultricies Ipsum Purus Vulputate');
  },
  'lightbox › Gallery': async (page) => {
    await page.locator('.js-lightbox').first().click();
    await expect(page.locator('.fs-lightbox-item')).toHaveCount(3);
  },
  'lightbox › Video': async (page) => {
    await page.locator('.js-lightbox').first().click();
    await expect(page.locator('.fs-lightbox-active iframe')).toHaveAttribute('src', /youtube\.com\/embed\/Ga6RYejo6Hk/);
  },
  'lightbox › Inline Content & URLs': async (page) => {
    await page.locator('.js-lightbox').first().click();
    await expect(page.locator('.fs-lightbox-active h2')).toHaveText('Adipiscing Vulputate Elit');
    await page.locator('.fs-lightbox-active .fs-lightbox-trigger-next').click();
    await expect(page.locator('.fs-lightbox-active iframe')).toHaveAttribute('src', /maps\.google\.com/);
  },
  'modal › Basic': async (page) => {
    await page.locator('.js-modal').click();
    await expect(page.locator('dialog.fs-modal')).toHaveAttribute('open', '');
    await expect(page.locator('dialog.fs-modal')).toHaveAccessibleName('Adipiscing Vulputate Elit');
    await page.locator('.fs-modal .fs-modal-trigger-close').click();
    await expect(page.locator('dialog.fs-modal')).toHaveCount(0);
  },
  'navigation › Toggle': async (page) => {
    await page.locator('#toggle-handle').click();
    await expect(page.locator('.js-navigation')).toBeVisible();
    await expect(page.locator('#toggle-handle')).toHaveAttribute('aria-expanded', 'true');
  },
  'navigation › Overlay': async (page) => {
    await page.locator('#overlay-left-handle').click();
    await expect(page.locator('.js-navigation').first()).toBeVisible();
    expect(await page.locator('#overlay-content').evaluate((el) => el.inert)).toBe(true);
  },
  'navigation › Push': async (page) => {
    await page.locator('#push-left-handle').click();
    await page.waitForTimeout(400);
    expect(await page.locator('#push-content').evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
  },
  'navigation › Reveal': async (page) => {
    await page.locator('#reveal-right-handle').click();
    await page.waitForTimeout(400);
    expect(await page.locator('#reveal-content').evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
  },
  'mediaquery › Basic': async (page) => {
    await page.setViewportSize({ width: 1000, height: 600 });
    await expect(page.locator('.js-status')).toHaveText('at least 600px wide');
    await page.setViewportSize({ width: 500, height: 600 });
    await expect(page.locator('.js-status')).toHaveText('narrower than 600px');
  },
};

let pages = fs.readdirSync(docs).filter((name) => fs.existsSync(path.join(docs, name, 'default.md')));

for (let page of pages) {
  let md = fs.readFileSync(path.join(docs, page, 'default.md'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  let titles = [...md.matchAll(/### ([^{\n]+)\{#demo-[^}]+\}[\s\S]*?<figure class="demo js-editor[^"]*"/g)].map((m) => m[1].trim());
  let count = (md.match(/<figure class="demo js-editor[^"]*"/g) || []).length;

  for (let i = 0; i < count; i++) {
    test(`docs demo: ${page} › ${titles[i] || i}`, async ({ page: browser }) => {
      let errors = [];

      browser.on('pageerror', (e) => errors.push(e.message));
      browser.on('console', (m) => {
        // Media from external hosts is blocked offline; that's expected
        if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) {
          errors.push(m.text());
        }
      });

      await offline(browser);
      await browser.goto(`/test/fixtures/docs-demo.html?page=${page}&demo=${i}`);
      await browser.waitForFunction(() => window.DEMO_READY === true);
      await browser.waitForTimeout(300);

      let interact = interactions[`${page} › ${titles[i]}`];

      if (interact) {
        await interact(browser);
      }

      expect(errors).toEqual([]);
    });
  }
}
