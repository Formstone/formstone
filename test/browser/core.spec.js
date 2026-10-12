import { expect, test } from '@playwright/test';
import { phases, result } from './helpers.js';

test.describe('Lifecycle', () => {
  for (let reducedMotion of ['no-preference', 'reduce']) {
    test(`H4: destroy() releases media queries; H1: Modal closes (${reducedMotion} motion)`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion });

      let r = await phases(page, 'destroy-h4-modal-h1.html');

      expect(r.errors).toEqual([]);
      expect(r.tabsAriaHiddenMobile).toBe('true');
      expect(r.tabsAriaHiddenAfterDestroy).toBe(null);
      expect(r.tabsAriaHiddenAfterResize).toBe(null);
      expect(r.bgInitial).toBe('a');
      expect(r.bgAfterReload).toBe('c');
      expect(r.bgAtWide).toBe('d');
      expect(r.bgLayersAddedAfterDestroy).toBe(0);
      expect(r.clicksBlockedAfterDestroy).toEqual([]);
      expect(r.modalOpened).toBe(true);
      expect(r.modalClose).toBe('resolved');
      expect(r.modalRemoved).toBe(true);
    });
  }
});

test.describe('CheckPoint', () => {
  test('H8: visible without JS and after disable()/destroy(); re-enable animates', async ({ page }) => {
    let r = await phases(page, 'checkpoint-h8.html');

    expect(r.activated).toEqual({ aOpacity: '1', aActive: true, belowFoldOpacity: '0', belowFoldActive: false });
    expect(r.noJsOpacity).toBe('1');
    expect(r.afterDisable).toEqual({ opacity: '1', active: false });
    expect(r.afterReEnable).toEqual({ opacity: '1', active: true });
    expect(r.afterDestroy).toEqual({ opacity: '1' });
    expect(r.belowFoldAfterScroll).toEqual({ opacity: '1', active: true });
  });
});

test.describe('MediaQuery', () => {
  test('M-B8, L-B2, L-B3: buckets, unbind, cleanup, duplicates', async ({ page }) => {
    let r = await phases(page, 'mediaquery-m-b8.html');

    expect(r.initial).toEqual(['gte:leave', 'lte:enter', 'case:leave', 'dup:leave']);
    expect(r.liveAfterSetup).toBe(4);
    expect(r.cleanup).toEqual({ afterBind: 5, afterUnbindOne: 5, afterUnbindBoth: 4 });
    // x1/x2 leave callbacks run during setup, after the initial log is captured
    expect(r.onWide).toEqual(['x1:leave', 'x2:leave', 'gte:enter', 'lte:leave', 'e1:enter', 'dup:enter']);
    expect(r.onNarrow).toEqual(['gte:leave', 'lte:enter', 'dup:leave']);
    expect(r.liveAfterUnbindAll).toBe(0);
    expect(r.duplicateWarned).toBe(true);
  });

  test('M-B8: range-syntax queries that used to collide stay separate', async ({ page }) => {
    let r = await phases(page, 'mediaquery-range-collision.html');

    expect(r).toEqual({
      initialAt500: ['gte:leave', 'lte:enter'],
      at1000: ['gte:enter', 'lte:leave'],
      backTo500: ['gte:leave', 'lte:enter'],
    });
  });
});

test.describe('Cookie', () => {
  test('M-U1, M-U2, L-U4: encoding, SameSite=None, max-age', async ({ page }) => {
    let r = await result(page, 'cookie-m-u.html');

    expect(r.errors).toEqual([]);
    expect(r.semicolonValue).toBe('x;y');
    expect(r.equalsInKey).toBe('v');
    expect(r.unicode).toBe('ümlaut & space');
    expect(r.sameSiteNone).toEqual({ value: 'v', written: 'n=v; max-age=604800; path=/; samesite=None; secure' });
    expect(r.malformedForeign).toBe('%E0%A4%A');
    expect(r.maxAge).toBe('max-age=2');
    expect(r.delete).toBe(null);
  });

  test("D4: path defaults to '/'; delete() clears the legacy directory copy", async ({ page }) => {
    let r = await result(page, 'cookie-d4-path.html');

    expect(r.setWrites).toEqual(['site=1; max-age=604800; path=/; samesite=Lax']);
    expect(r.beforeDelete).toEqual(['legacy=old', 'legacy=new']);
    expect(r.afterDelete).toEqual([]);
    expect(r.explicitPathDeleteLeavesDirCopy).toEqual(['scoped=keep']);
  });
});

test.describe('Utils', () => {
  test('L-U3, L-U4: iterable collections, falsy event detail, setAttr removal', async ({ page }) => {
    let r = await result(page, 'utils-low.html');

    expect(r.errors).toEqual([]);
    expect(r.U3_counts).toEqual({ HTMLCollection: 3, Set: 2, NodeList: 3, Array: 3, form: 1, select: 1, string: 1, window: 1, element: 1, null: 0 });
    expect(r.U3_onHTMLCollection).toBe(1);
    expect(r.U4_triggerDetails).toEqual([0, false, '', null, null, { a: 1 }]);
    expect(r.U4_setAttrFalseyRemoves).toEqual([false, false]);
  });
});

test.describe('jQuery', () => {
  test('M-U4: global jQuery registration and method return values', async ({ page }) => {
    let r = await result(page, 'jquery-global.html');

    expect(r.errors).toEqual([]);
    expect(r.registered).toEqual({ modal: 'function', swap: 'function', cookie: 'function' });
    expect(r.initReturnsJq).toBe(true);
    expect(r.chainReturnsJq).toBe(true);
    expect(r.closeReturns).toBe('Promise');
    expect(r.promiseResolved).toBe(true);
    expect(r.cookieGet).toBe('1');
  });

  test('M-U3: install($) registers plugins on a non-global jQuery', async ({ page }) => {
    let r = await result(page, 'jquery-install.html');

    expect(r).toEqual({ errors: [], globalJQuery: 'undefined', beforeInstall: 'undefined', installExported: 'function', afterInstall: 'function', instance: true });
  });
});

test.describe('dist', () => {
  test('production bundles load and run components', async ({ page }) => {
    let r = await result(page, 'dist-smoke.html');

    expect(r.errors).toEqual([]);
    expect(r.exports).toBe(10);
    // Dialogs and backdrops fade in from 0
    expect(r.lightbox.minDialog).toBe(0);
    expect(r.lightbox.minBackdrop).toBe(0);
    expect(r.modal.last).toEqual([1, 1]);
  });
});
