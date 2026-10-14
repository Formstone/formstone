import { expect, test } from '@playwright/test';
import { out, ready, result, touchDrag } from './helpers.js';

test.describe('Lightbox', () => {
  for (let reducedMotion of ['no-preference', 'reduce']) {
    test(`H1–H3: closes, unloads video and escapes captions (${reducedMotion} motion)`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion });

      let r = await out(page, 'lightbox-h1-h3.html');

      expect(r.reducedMotion).toBe(reducedMotion === 'reduce');
      // H3: caption is text, never parsed as HTML
      expect(r.captionText).toBe('<img src=x onerror="window.__xss=1">');
      expect(r.captionChildEls).toBe(0);
      expect(r.xssRan).toBe(false);
      // H2: iframe unloaded after moving to the next item
      expect(r.iframeSrcOpen).toMatch(/frame\.html$/);
      expect(r.iframeSrcAfterNext).toBe('');
      // H1: close completes, even with 0s transitions
      expect(r.closePromise).toBe('resolved');
      expect(r.dialogRemoved).toBe(true);
      expect(r.reopened).toBe(true);
    });

    test(`H2: unloads video without a details box (${reducedMotion} motion)`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion });

      let r = await out(page, 'lightbox-h2-no-details.html');

      expect(r.iframeSrcAfterNext).toBe('');
      expect(r.closePromise).toBe('resolved');
    });
  }

  test('H9: overriding one video provider keeps its pattern', async ({ page }) => {
    let r = await result(page, 'utils-h9-extend.html');

    expect(r.youtube.iframeSrc).toContain('custom-abcdefghijk');
    expect(r.page.iframeSrc).toMatch(/frame\.html$/);
  });

  test('M-L1–M-L3: dialog reference, open(index), destroy() cleanup', async ({ page }) => {
    let r = await result(page, 'lightbox-modal-m-l1-l3.html');

    expect(r.errors).toEqual([]);
    // M-L1: missing #hash target skipped; one dialog at a time
    expect(r.openFromG4).toEqual({ dialogs: 1, items: 3, active: 2, ordinal: '3 of 3' });
    // M-L2: open(0) and clamped open(99)
    expect(r.open0).toEqual({ dialogs: 1, items: 3, active: 0, ordinal: '1 of 3' });
    expect(r.open99).toEqual({ dialogs: 1, items: 3, active: 2, ordinal: '3 of 3' });
    expect(r.afterContainerClick).toEqual({ dialogs: 0 });
    expect(r.digitIdContentBack).toBe(true);
    // M-L3: Space handler and trigger attributes removed
    expect(r.lightboxAfterDestroySpace).toEqual({ dialogs: 0, role: null, haspopup: null, label: null });
    expect(r.modal).toEqual({ opened: true, contentInDialog: true, decoyUntouched: true });
    expect(r.modalAfterDestroySpace).toEqual({ opened: false, role: null, label: null });
  });

  test('M-L4: clicks reach controls inside items; swipes still navigate', async ({ page }) => {
    await ready(page, 'lightbox-m-l4-element-input.html');

    let state = () => page.evaluate(() => window.state());
    let rect = (sel) => page.evaluate((s) => window.rect(s), sel);

    await page.evaluate(() => document.getElementById('g1').click());
    await page.waitForTimeout(600);

    let btn = await rect('.fs-lightbox-active #btn');

    await page.mouse.click(btn.x, btn.y);
    expect((await state()).clicks.btn).toBe(1);

    let txt = await rect('.fs-lightbox-active #txt');

    await page.mouse.click(txt.x, txt.y);
    await page.waitForTimeout(150);
    expect(await state()).toMatchObject({ open: true, active: 0 });

    // Mouse swipe to the next item
    await page.mouse.move(txt.x + 100, txt.y);
    await page.mouse.down();
    await page.mouse.move(txt.x - 150, txt.y, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    expect(await state()).toMatchObject({ open: true, active: 1 });

    let btn2 = await rect('.fs-lightbox-active #btn2');

    await page.mouse.click(btn2.x, btn2.y);
    expect((await state()).clicks.btn2).toBe(1);

    // A touch drag on element content pans natively (pointercancel), then the next click still lands
    let txt2 = await rect('.fs-lightbox-active #txt2');

    await touchDrag(page, txt2.x + 100, txt2.y, 250);

    let media = await page.evaluate(() => {
      let r = document.querySelector('.fs-lightbox-active .fs-lightbox-media').getBoundingClientRect();

      return { x: Math.round(r.left + r.width / 2), y: Math.min(790, Math.round(r.bottom + 30)) };
    });

    await page.mouse.click(media.x, media.y);
    await page.waitForTimeout(600);
    expect((await state()).open).toBe(false);
  });

  test('M-L4: image swipes, taps and outside clicks', async ({ page }) => {
    await ready(page, 'lightbox-m-l4-image-input.html');

    let state = () => page.evaluate(() => window.state());

    await page.evaluate(() => document.getElementById('i1').click());
    await page.waitForTimeout(700);

    let img = await page.evaluate(() => window.rect('.fs-lightbox-active img'));

    await touchDrag(page, img.x, img.y, -250);
    expect(await state()).toMatchObject({ open: true, active: 1 });

    let img2 = await page.evaluate(() => window.rect('.fs-lightbox-active img'));

    await page.mouse.click(img2.x, img2.y);
    await page.waitForTimeout(150);
    expect(await state()).toMatchObject({ open: true, active: 1 });

    await page.mouse.click(500, img2.bottom + 20);
    await page.waitForTimeout(600);
    expect((await state()).open).toBe(false);
  });

  test('M-P3: direction comes from the document per instance', async ({ page }) => {
    let r = await result(page, 'lightbox-rtl.html');

    expect(r).toEqual({ docRtl: true, optionLtr: false });
  });
});

test.describe('Lightbox and Modal (Low tier)', () => {
  test('L-L1, L-L3–L-L8: errors, selectors, detection, URLs, keys, naming, scroll lock', async ({ page }) => {
    await ready(page, 'lightbox-modal-low.html');

    let ev = (fn, arg) => page.evaluate(fn, arg);

    // L-L1: broken image stops loading
    await ev(() => {
      window.L.construct('#broken, #ok2');
      document.getElementById('broken').click();
    });
    await page.waitForTimeout(800);
    expect(await ev(() => ({
      loadingVisible: document.querySelector('.fs-lightbox-loading').classList.contains('fs-lightbox-visible'),
      ariaBusy: document.querySelector('dialog.fs-lightbox').getAttribute('aria-busy'),
      error: window.activeItem().classList.contains('fs-lightbox-error'),
    }))).toEqual({ loadingVisible: false, ariaBusy: 'false', error: true });
    await ev(() => window.closeAll());

    // L-L3: gallery names are escaped
    await ev(() => {
      window.L.construct('#q1, #q2');
      document.getElementById('q1').Lightbox.open();
    });
    await page.waitForTimeout(500);
    expect(await ev(() => document.querySelectorAll('.fs-lightbox-item').length)).toBe(2);
    await ev(() => window.closeAll());

    // L-L4: image detection is anchored to the end of the path
    expect(await ev(async () => {
      let r = {};

      for (let a of document.querySelectorAll('.det')) {
        new window.L(a);
        a.Lightbox.open();
        await window.wait(400);

        let m = document.querySelector('.fs-lightbox-media');

        r[a.textContent] = m ? m.className.replace('fs-lightbox-media ', '') : 'none';

        await a.Lightbox.close();
        await window.wait(150);
      }

      return r;
    })).toEqual({
      'jpeg.org': 'fs-lightbox-media_iframe',
      'svg?v': 'fs-lightbox-media_image',
      'JPG': 'fs-lightbox-media_image',
      'jpg.html': 'fs-lightbox-media_iframe',
    });

    // L-L5: javascript: URLs are never loaded in an iframe
    await ev(() => {
      new window.L(document.getElementById('js'));
      document.getElementById('js').Lightbox.open();
    });
    await page.waitForTimeout(500);
    expect(await ev(() => ({ dialog: !!document.querySelector('dialog.fs-lightbox'), pwned: !!window.__pwned }))).toEqual({ dialog: false, pwned: false });
    expect(await ev(() => window.warnings)).toContain('Lightbox: Unsupported URL javascript:window.__pwned=1');

    // L-L8 + L-L6: element media touch-action; arrow keys ignored in form fields
    await ev(() => {
      window.L.construct('#e1, #e2');
      document.getElementById('e1').click();
    });
    await page.waitForTimeout(600);
    expect(await ev(() => getComputedStyle(document.querySelector('.fs-lightbox-media_element')).touchAction)).toBe('pan-y');

    let activeIndex = () => ev(() => [...document.querySelectorAll('.fs-lightbox-item')].indexOf(window.activeItem()));

    await page.locator('.fs-lightbox #field').focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    expect(await activeIndex()).toBe(0);

    await page.locator('.fs-lightbox-close').focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    expect(await activeIndex()).toBe(1);

    // L-L7: scroll lock while open
    let overflow = () => ev(() => getComputedStyle(document.documentElement).overflow);

    expect(await overflow()).toBe('hidden');
    await ev(() => window.closeAll());
    expect(await overflow()).toBe('visible');

    // L-L7: modal accessible name and scroll lock
    let modalState = () => ev(() => {
      let d = document.querySelector('dialog.fs-modal');
      let by = d.getAttribute('aria-labelledby');

      return {
        role: d.getAttribute('role'),
        label: d.getAttribute('aria-label'),
        labelledText: by ? document.getElementById(by).textContent : null,
        htmlOverflow: getComputedStyle(document.documentElement).overflow,
      };
    });

    await ev(() => {
      window.M.construct('#m1');
      document.getElementById('m1').Modal.open();
    });
    await page.waitForTimeout(400);
    expect(await modalState()).toEqual({ role: null, label: null, labelledText: 'Settings', htmlOverflow: 'hidden' });
    await ev(() => window.closeAll());
    expect(await ev(() => document.querySelector('#mc1 h2').hasAttribute('id'))).toBe(false);
    expect(await overflow()).toBe('visible');

    await ev(() => {
      window.M.construct('#m2');
      document.getElementById('m2').Modal.open();
    });
    await page.waitForTimeout(400);
    expect(await modalState()).toMatchObject({ label: 'Dialog', labelledText: null });
    await ev(() => window.closeAll());

    await ev(() => {
      new window.M(document.getElementById('m3'), { label: 'Custom' });
      document.getElementById('m3').Modal.open();
    });
    await page.waitForTimeout(400);
    expect(await modalState()).toMatchObject({ label: 'Custom' });
    await ev(() => window.closeAll());
    expect(await ev(() => document.querySelector('#mc3 h3').id)).toBe('own');

    expect(await ev(() => window.errors)).toEqual([]);
  });
});

test.describe('Lightbox and Modal (docs follow-ups)', () => {
  test('close() always returns a Promise', async ({ page }) => {
    await ready(page, 'lightbox-modal-close-loop.html');

    expect(await page.evaluate(async () => {
      window.L.construct('#g1, #g2, #g3');
      window.M.construct('#mt');

      let lb = document.getElementById('g1').Lightbox.close();
      let md = document.getElementById('mt').Modal.close();

      return { lightbox: lb instanceof Promise, modal: md instanceof Promise, resolved: (await Promise.all([lb, md])).length };
    })).toEqual({ lightbox: true, modal: true, resolved: 2 });
  });

  test('loop wraps from the last item to the first and back', async ({ page }) => {
    await ready(page, 'lightbox-modal-close-loop.html');

    expect(await page.evaluate(async () => {
      new window.L(document.getElementById('g1'), { loop: true });
      new window.L(document.getElementById('g2'), { loop: true });
      new window.L(document.getElementById('g3'), { loop: true });

      let lb = document.getElementById('g3').Lightbox;

      lb.open();
      await window.wait(400);

      let start = window.activeIndex();

      lb.next();
      await window.wait(100);

      let afterNext = window.activeIndex();

      lb.previous();
      await window.wait(100);

      let afterPrevious = window.activeIndex();

      await lb.close();

      return { start, afterNext, afterPrevious };
    })).toEqual({ start: 2, afterNext: 0, afterPrevious: 2 });
  });

  test('commands control the open lightbox; window listeners are removed on every close path', async ({ page }) => {
    await ready(page, 'lightbox-modal-close-loop.html');

    expect(await page.evaluate(async () => {
      window.L.construct('#g1, #g2, #g3');

      let lb = document.getElementById('g1').Lightbox;
      let closes = [];

      window.addEventListener('lightbox:close', (e) => closes.push(e.detail && e.detail.el ? 'notification' : 'command'));

      lb.open();
      await window.wait(400);
      window.U.trigger(window, 'lightbox:next');
      await window.wait(100);

      let afterNextCommand = window.activeIndex();

      // 'Stuck' path: close() without the open class skips the transition
      document.querySelector('.fs-lightbox').classList.remove('fs-lightbox-open');
      await lb.close();

      let index = lb.index;

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      window.U.trigger(window, 'lightbox:next');
      await window.wait(100);

      return { afterNextCommand, closes, indexUnchangedAfterClose: lb.index === index, isOpen: lb.isOpen, errors: window.errors };
    })).toEqual({ afterNextCommand: 1, closes: ['notification'], indexUnchangedAfterClose: true, isOpen: false, errors: [] });
  });

  test('modal:close command and fs-modal-trigger-close close the modal', async ({ page }) => {
    await ready(page, 'lightbox-modal-close-loop.html');

    expect(await page.evaluate(async () => {
      window.M.construct('#mt');

      let md = document.getElementById('mt').Modal;
      let closes = [];

      window.addEventListener('modal:close', (e) => closes.push(e.detail && e.detail.el ? 'notification' : 'command'));

      md.open();
      await window.wait(300);
      window.U.trigger(window, 'modal:close');
      await window.wait(500);

      let afterCommand = md.isOpen;

      md.open();
      await window.wait(300);
      document.querySelector('.fs-modal .fs-modal-trigger-close').click();
      await window.wait(500);

      return { afterCommand, afterTriggerClass: md.isOpen, closes };
    })).toEqual({ afterCommand: false, afterTriggerClass: false, closes: ['command', 'notification', 'notification'] });
  });
});

test.describe('Escape', () => {
  for (let which of ['modal', 'lightbox']) {
    test(`Escape closes the ${which} with the same transition, staying modal until it ends`, async ({ page }) => {
      await ready(page, 'lightbox-modal-close-loop.html');
      await page.evaluate((w) => {
        window.L.construct('#g1, #g2, #g3');
        window.M.construct('#mt');
        window.closes = 0;
        window.addEventListener(`${w}:close`, (e) => {
          if (e.detail && e.detail.el) {
            window.closes++;
          }
        });
        (w === 'modal' ? document.getElementById('mt').Modal : document.getElementById('g1').Lightbox).open();
      }, which);
      await page.waitForTimeout(500);

      await page.keyboard.press('Escape');

      let duringFade = await page.evaluate((w) => {
        let d = document.querySelector(`dialog.fs-${w}`);

        return { open: d.open, modal: d.matches(':modal') };
      }, which);

      expect(duringFade).toEqual({ open: true, modal: true });

      await page.waitForTimeout(700);

      expect(await page.evaluate((w) => ({
        removed: !document.querySelector(`dialog.fs-${w}`),
        isOpen: (w === 'modal' ? document.getElementById('mt').Modal : document.getElementById('g1').Lightbox).isOpen,
        contentBack: !!document.querySelector('#mc h2'),
        closes: window.closes,
      }), which)).toEqual({ removed: true, isOpen: false, contentBack: true, closes: 1 });
    });
  }
});
