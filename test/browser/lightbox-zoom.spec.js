import { expect, test } from '@playwright/test';
import { ready, touchDrag, touchPinch, touchTap } from './helpers.js';

// The 1000x800 view fits big.svg (3000x2250) at 1000x750, centered at (500, 400)

let zoom = (page) => page.evaluate(() => window.zoom());

test.describe('Lightbox zoom', () => {
  test.beforeEach(async ({ page }) => {
    await ready(page, 'lightbox-zoom.html');
  });

  test('buttons and keys step the zoom, capped at full resolution', async ({ page }) => {
    await page.evaluate(() => openBox('single'));

    expect(await zoom(page)).toMatchObject({ scale: 1, zoomable: true, zoomed: false, buttons: true, inDisabled: false, outDisabled: true });

    await page.locator('.fs-lightbox-zoom_in').click();
    expect(await zoom(page)).toMatchObject({ scale: 1.5, x: 0, y: 0, zoomed: true, outDisabled: false });

    await page.keyboard.press('+');
    await page.keyboard.press('+');
    // 1.5 → 2.25 → 3.375, capped at 3x (full resolution)
    expect(await zoom(page)).toMatchObject({ scale: 3, inDisabled: true });

    await page.keyboard.press('-');
    expect(await zoom(page)).toMatchObject({ scale: 2 });

    await page.keyboard.press('0');
    expect(await zoom(page)).toMatchObject({ scale: 1, zoomed: false, outDisabled: true });

    // Public methods
    await page.evaluate(() => document.getElementById('single').Lightbox.zoomIn());
    expect((await zoom(page)).scale).toBe(1.5);
    await page.evaluate(() => document.getElementById('single').Lightbox.zoomReset());
    expect((await zoom(page)).scale).toBe(1);
  });

  test('double-click zooms at the pointer; drag pans within bounds without closing', async ({ page }) => {
    await page.evaluate(() => openBox('single'));

    await page.mouse.dblclick(700, 300);
    // The point under the pointer stays put: offset = center - point
    expect(await zoom(page)).toMatchObject({ scale: 2, x: -200, y: 100, open: true });

    await page.mouse.move(500, 400);
    await page.mouse.down();
    await page.mouse.move(450, 420, { steps: 5 });
    await page.mouse.move(400, 450, { steps: 5 });
    await page.mouse.up();
    expect(await zoom(page)).toMatchObject({ scale: 2, x: -300, y: 150, open: true });

    // At 2x the 2000x1500 image can move 500px sideways and 350px up or down
    await page.mouse.move(500, 400);
    await page.mouse.down();
    await page.mouse.move(-1500, 1500, { steps: 10 });
    await page.mouse.up();
    expect(await zoom(page)).toMatchObject({ x: -500, y: 350, open: true });

    await page.mouse.dblclick(500, 400);
    expect(await zoom(page)).toMatchObject({ scale: 1, x: 0, y: 0, zoomed: false, open: true });
  });

  test('pinch zooms; a pinch back to the fitted size resets', async ({ page }) => {
    await page.evaluate(() => openBox('single'));

    await touchPinch(page, 500, 400, 200, 400);
    expect(await zoom(page)).toMatchObject({ scale: 2, x: 0, y: 0, open: true });

    await touchPinch(page, 500, 400, 400, 205);
    expect(await zoom(page)).toMatchObject({ scale: 1, zoomed: false, open: true });

    // Double-tap
    await touchTap(page, 700, 300);
    await page.waitForTimeout(50);
    await touchTap(page, 700, 300);
    await page.waitForTimeout(400);
    expect(await zoom(page)).toMatchObject({ scale: 2, x: -200, y: 100, open: true });
  });

  test('Ctrl + wheel zooms and wheel pans', async ({ page }) => {
    await page.evaluate(() => openBox('single'));

    await page.mouse.move(500, 400);
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -50);
    await page.keyboard.up('Control');
    await page.waitForTimeout(100);
    expect(await zoom(page)).toMatchObject({ scale: 1.5, x: 0, y: 0 });

    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(100);
    expect(await zoom(page)).toMatchObject({ scale: 1.5, x: 0, y: -100 });
  });

  test('galleries: zoomed drags and arrow keys pan instead of changing items; changing items resets', async ({ page }) => {
    await page.evaluate(() => openBox('g1'));

    await page.locator('.fs-lightbox-zoom_in').click();
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);
    // Arrow keys pan by a tenth of the view
    expect(await zoom(page)).toMatchObject({ index: 0, scale: 1.5, x: 100 });

    await touchDrag(page, 600, 400, -300);
    expect(await zoom(page)).toMatchObject({ index: 0, scale: 1.5, x: -200, open: true });

    await page.locator('.fs-lightbox-control_next').click();
    await page.waitForTimeout(300);
    expect(await zoom(page)).toMatchObject({ index: 1, scale: 1, zoomed: false });
    expect(await page.evaluate(() => document.querySelector('.fs-lightbox-item_0 .fs-lightbox-image').style.transform)).toBe('');

    // At 1x, swipes still change items
    await touchDrag(page, 600, 400, -300);
    await page.waitForTimeout(300);
    let item = await zoom(page);
    expect(item).toMatchObject({ index: 2, zoomable: false, buttons: false });

    // Element items don't zoom; keys fall through
    await page.keyboard.press('+');
    expect(await zoom(page)).toMatchObject({ index: 2, zoomed: false });
  });

  test('resize and reopening reset the zoom', async ({ page }) => {
    await page.evaluate(() => openBox('single'));

    await page.keyboard.press('+');
    await page.setViewportSize({ width: 900, height: 800 });
    await page.waitForTimeout(100);
    expect(await zoom(page)).toMatchObject({ scale: 1, zoomed: false });

    await page.keyboard.press('+');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await page.evaluate(() => openBox('single'));
    expect(await zoom(page)).toMatchObject({ scale: 1, zoomed: false });
  });

  test('unavailable buttons use aria-disabled: they keep focus, look dimmed and ignore clicks', async ({ page }) => {
    await page.evaluate(() => openBox('g1'));

    let state = (sel) => page.locator(sel).evaluate((el) => ({
      ariaDisabled: el.getAttribute('aria-disabled'),
      disabled: el.disabled,
      focused: document.activeElement === el,
      opacity: getComputedStyle(el).opacity,
      cursor: getComputedStyle(el).cursor,
    }));

    // First item: previous is unavailable but still clickable without effect
    expect(await state('.fs-lightbox-control_previous')).toMatchObject({ ariaDisabled: 'true', disabled: false, opacity: '0.5', cursor: 'default' });
    expect(await state('.fs-lightbox-control_next')).toMatchObject({ ariaDisabled: null, opacity: '1', cursor: 'pointer' });
    // force: Playwright won't click aria-disabled elements otherwise
    await page.locator('.fs-lightbox-control_previous').click({ force: true });
    await page.waitForTimeout(300);
    expect(await zoom(page)).toMatchObject({ index: 0, open: true });

    // Ignored, not just a no-op: changing items would reset the zoom
    await page.keyboard.press('+');
    await page.locator('.fs-lightbox-control_previous').click({ force: true });
    expect(await zoom(page)).toMatchObject({ index: 0, scale: 1.5 });
    await page.keyboard.press('0');

    // Zooming in to the maximum keeps focus on the button
    await page.locator('.fs-lightbox-zoom_in').focus();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Enter');
    }
    expect(await zoom(page)).toMatchObject({ scale: 3, inDisabled: true });
    await page.waitForTimeout(300);
    expect(await state('.fs-lightbox-zoom_in')).toMatchObject({ ariaDisabled: 'true', focused: true, opacity: '0.5' });

    // Last item: next is unavailable; Enter on it does nothing and focus stays
    await page.keyboard.press('0');
    await page.evaluate(() => document.getElementById('g1').Lightbox.jump(2));
    await page.locator('.fs-lightbox-control_next').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    expect(await zoom(page)).toMatchObject({ index: 2, open: true });
    expect(await state('.fs-lightbox-control_next')).toMatchObject({ ariaDisabled: 'true', focused: true });
  });

  test('zoomMax, small images and zoom: false', async ({ page }) => {
    await page.evaluate(() => openBox('max'));
    await page.keyboard.press('+');
    await page.keyboard.press('+');
    expect(await zoom(page)).toMatchObject({ scale: 1.5, inDisabled: true });
    await page.evaluate(() => closeBox());

    // Below full resolution already, but zoom still reaches 2x
    await page.evaluate(() => openBox('small'));
    await page.keyboard.press('+');
    await page.keyboard.press('+');
    expect((await zoom(page)).scale).toBe(2);
    await page.evaluate(() => closeBox());

    await page.evaluate(() => openBox('off'));
    expect(await zoom(page)).toMatchObject({ zoomable: false, buttons: false });
    await page.mouse.dblclick(500, 400);
    await page.keyboard.press('+');
    expect(await zoom(page)).toMatchObject({ scale: 1, open: true });

    expect(await page.evaluate(() => window.errors)).toEqual([]);
  });
});
