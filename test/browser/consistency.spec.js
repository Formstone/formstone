import { expect, test } from '@playwright/test';
import { result } from './helpers.js';

test('Consistency: element events, CheckPoint detail, Tabs ids, Swap target warning', async ({ page }) => {
  let r = await result(page, 'consistency.html');

  expect(r.errors).toEqual([]);
  // Lightbox and Modal fire on the trigger element and the window
  expect(r.lightboxEvents).toEqual([
    ['el', 'lightbox:open', true], ['window', 'lightbox:open', true],
    ['el', 'lightbox:close', true], ['window', 'lightbox:close', true],
  ]);
  expect(r.modalEvents).toEqual([
    ['el', 'modal:open', true], ['window', 'modal:open', true],
    ['el', 'modal:close', true], ['window', 'modal:close', true],
  ]);
  // Events without data have a null detail, like the other components
  expect(r.checkpointDetail).toBe(null);
  // Generated ids are removed on destroy; the panel's own id is kept
  expect(r.tabsIdsWhileActive).toEqual([true, 'p1']);
  expect(r.tabsIdsAfterDestroy).toEqual([null, 'p1']);
  expect(r.warnings).toContain('Swap: Target #nope not found');
});
