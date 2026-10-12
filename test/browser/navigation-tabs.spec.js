import { expect, test } from '@playwright/test';
import { phases, ready, result } from './helpers.js';

test.describe('Navigation and Tabs', () => {
  test('H7: opening a second navigation closes the first and restores the page', async ({ page }) => {
    let r = await phases(page, 'navigation-h7-groups.html');

    expect(r.errors).toEqual([]);
    expect(r.afterOpenA).toEqual({ mainInert: true, aOpen: true, events: ['na open'] });
    expect(r.afterOpenB).toEqual({ mainInert: true, aOpen: false, bOpen: true, events: ['na close', 'nb open'] });
    expect(r.afterEscape).toEqual({ mainInert: false, aOpen: false, bOpen: false, events: ['nb close'] });
    expect(r.tabsSwitch.events).toEqual(['t1 deactivate', 't2 activate']);
    expect(r.swapGroup.events).toEqual(['s1 activate', 's1 deactivate', 's2 activate']);
  });

  test('H10: the URL hash selects its tab', async ({ page }) => {
    let r = await result(page, 'tabs-h10-hash.html#p2');

    expect(r.errors).toEqual([]);
    expect(r.groupG).toEqual({ selected: { t1: 'false', t2: 'true', t3: 'false' }, activePanels: ['p2'] });
    expect(r.quoteGroup).toEqual({ selected: { q1: 'false', q2: 'true' }, activePanels: ['r2'] });
  });

  test('H10: an unmatched hash falls back to data-tabs-active', async ({ page }) => {
    let r = await result(page, 'tabs-h10-hash.html#nomatch');

    expect(r.groupG).toEqual({ selected: { t1: 'false', t2: 'false', t3: 'true' }, activePanels: ['p3'] });
  });

  test('M-N1–M-N3, M-T1–M-T3: aria-expanded, inert focus trap, guards, tab order, arrow keys', async ({ page }) => {
    await ready(page, 'navigation-tabs-m-n-m-t.html', { width: 500, height: 800 });

    let navState = () => page.evaluate(() => window.navState());
    let rect = (id) => page.evaluate((i) => window.rect(i), id);

    let h = await rect('h');

    await page.mouse.click(h.x, h.y);
    await page.waitForTimeout(200);
    expect(await navState()).toEqual({ open: true, expanded: 'true', haspopup: 'dialog', inert: ['hdr', 'side', 'main'], ariaHidden: [], active: 'l1' });

    // M-N2: Tab stays inside the open navigation
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      expect(['l1', 'l2', 'BODY']).toContain(await page.evaluate(() => document.activeElement.id || document.activeElement.tagName));
    }

    // Outside click closes (clicks on inert content land on <html>)
    await page.mouse.click(490, 400);
    await page.waitForTimeout(400);
    expect(await navState()).toMatchObject({ open: false, expanded: 'false', inert: [], active: 'h' });

    await page.mouse.click(h.x, h.y);
    await page.waitForTimeout(200);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    expect(await navState()).toMatchObject({ open: false, expanded: 'false', inert: [], active: 'h' });

    // M-T1: tab order at mobile width and after resizing
    expect(await page.evaluate(() => ({ t1: window.$('t1').getAttribute('tabindex'), t1hidden: window.$('t1').getAttribute('aria-hidden'), t2: window.$('t2').getAttribute('tabindex') }))).toEqual({ t1: '-1', t1hidden: 'true', t2: '-1' });

    await page.setViewportSize({ width: 1000, height: 800 });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => ['t1', 't2', 'a1', 'a2'].map((id) => window.$(id).getAttribute('tabindex')))).toEqual(['0', '-1', '0', '-1']);

    // M-T2: arrow keys stay in the group
    await page.locator('#a2').focus();
    await page.keyboard.press('ArrowRight');
    expect(await page.evaluate(() => document.activeElement.id)).toBe('a1');

    // M-N3, M-T3: missing elements warn instead of throwing
    expect(await page.evaluate(() => window.errors)).toEqual([]);

    let warnings = await page.evaluate(() => window.warnings);

    expect(warnings).toContain('Navigation: Handle not found; set data-navigation-handle');
    expect(warnings.filter((w) => w.startsWith('Tabs: Panel not found'))).toHaveLength(2);
  });
});

test.describe('Navigation, Tabs and CheckPoint (Low tier)', () => {
  test('L-N1–L-N4: parent height, open() from click, focus, ungrouped tabs, events, tabindex', async ({ page }) => {
    await ready(page, 'navigation-tabs-checkpoint-low.html', { width: 1000, height: 1200 });
    await page.waitForTimeout(300);

    let ev = (fn) => page.evaluate(fn);
    let click = async (id) => {
      let p = await page.evaluate((i) => window.rect(i), id);

      await page.mouse.click(p.x, p.y);
      await page.waitForTimeout(250);
    };

    // L-N1
    expect(await ev(() => window.$('cp').CheckPoint.active)).toBe(true);

    // L-N2
    await click('opener');
    expect(await ev(() => window.$('n1').Navigation.isOpen)).toBe(true);
    await ev(() => window.$('n1').Navigation.close());
    await page.waitForTimeout(100);

    await click('h1');
    expect(await ev(() => window.$('n1').Navigation.isOpen)).toBe(true);
    await click('outside');
    expect(await ev(() => ({ open: window.$('n1').Navigation.isOpen, focus: document.activeElement.id }))).toEqual({ open: false, focus: 'outside' });

    // L-N4: no bogus "-content" class
    expect((await ev(() => window.$('n1').Navigation.contentOpenClasses)).filter(Boolean)).toEqual(['fs-navigation-open']);

    // L-N3: ungrouped tabs are independent
    expect(await ev(() => [window.$('ta').getAttribute('data-swap-group'), window.$('tb').getAttribute('data-swap-group')])).toEqual([null, null]);
    await click('ta');
    await click('tb');
    expect(await ev(() => [window.$('ta').getAttribute('aria-selected'), window.$('tb').getAttribute('aria-selected')])).toEqual(['true', 'true']);

    // L-N4: events fire once per tab; tabindex restored on destroy
    expect(await ev(() => window.tabEvents.enable)).toBe(2);
    await ev(() => window.$('ta').Tabs.destroy());
    expect(await ev(() => window.tabEvents.disable)).toBe(1);

    await ev(() => {
      window.$('n2').Navigation.destroy();
      window.$('n1').Navigation.destroy();
    });
    expect(await ev(() => [window.$('h2').getAttribute('tabindex'), window.$('h1').getAttribute('tabindex')])).toEqual([null, null]);

    expect(await ev(() => window.errors)).toEqual([]);
  });
});
