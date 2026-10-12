import { expect, test } from '@playwright/test';
import { phases, result } from './helpers.js';

test.describe('Background', () => {
  test('H5: mute() and unmute() work; the mute option still applies', async ({ page }) => {
    let r = await phases(page, 'background-h5-mute.html');

    expect(r).toEqual({
      defaultMuted: true,
      typeofMute: 'function',
      unmute: 'ok',
      afterUnmute: false,
      mute: 'ok',
      afterMute: true,
      mute2: 'ok',
      unmute2: 'ok',
      afterUnmute2: false,
      optionFalse: false,
      dataOptionFalse: false,
      defaultsFalse: false,
      defaultsTypeofMute: 'function',
    });
  });

  test('H6: play/pause/mute before the YouTube player is ready', async ({ page }) => {
    let r = await phases(page, 'background-h6-youtube-ready.html');

    expect(r.queued).toEqual({ play: 'ok', pause: 'ok', mute: 'ok', unmute: 'ok', play2: 'ok' });
    expect(r.queuedPlayerCalls).toEqual(['play']);
    expect(r.queuedEmbedOpacity).toBe('1');
    expect(r.notReady).toEqual({ play: 'ok', mute: 'ok' });
    expect(r.notReadyPlayerCalls).toEqual(['mute', 'play', 'pause', 'play']);
    expect(r.notReadyEmbedOpacity).toBe('1');
    expect(r.pauseBeforeReadyCalls).toEqual(['mute', 'pause']);
    expect(r.afterReady).toEqual({ pause: 'ok', play: 'ok', calls: ['pause', 'play'] });
  });

  test('M-B1, M-B2, M-B4: no source, bad URLs, stale and destroyed queue items', async ({ page }) => {
    let r = await result(page, 'background-m-b-api-not-loaded.html');

    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual(['Background: Unrecognized YouTube URL']);
    expect(r.noSource).toEqual({ loadedClass: false, layers: 0 });
    expect(r.callerSourceMutated).toBe(false);
    expect(r.playersCreatedFor).toEqual(['okokokokokk']);
    expect(r.staleLastLayer).toBe('image a.svg');
  });

  for (let reducedMotion of ['no-preference', 'reduce']) {
    test(`M-B2, M-B3, M-B5–M-B7: API already loaded (${reducedMotion} motion)`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion });

      let r = await result(page, 'background-m-b-api-loaded.html');
      let reduce = (reducedMotion === 'reduce');

      expect(r.errors).toEqual([]);
      expect(r.playersImmediately).toEqual(['watchwatchw', 'shortsshort', 'liveliveliv', 'embedembedd', 'embedurlurl']);
      expect(r.youtubeOnReadyCalls).toEqual(['mute', reduce ? 'pause' : 'play']);
      expect(r.destroy).toEqual({ playerDestroyed: true, classes: '' });
      expect(r.videoAutoplay).toBe(!reduce);
      expect(r.imageLayersAfter3Loads).toBe(1);
    });
  }

  test('M-B3: YouTube API ready through YT.ready() when the global callback is overwritten', async ({ page }) => {
    let r = await result(page, 'background-m-b-callback-overwritten.html');

    expect(r.playersCreatedFor).toEqual(['overwritten']);
  });
});

test.describe('Background and Swap (Low tier)', () => {
  test('L-B1, L-B4: numeric widths, quoted image URLs, refused play()', async ({ page }) => {
    let r = await result(page, 'background-swap-low.html');

    expect(r.errors).toEqual([]);
    expect(r.B1_swapNumeric).toEqual({ mq: '(min-width: 0px) and (max-width: 2000px)', enabled: true });
    expect(r.B1_tabsNumericMobile).toBe(true);
    expect(r.B4_bgImage.style).toContain('img dir/a (1).svg');
    expect(r.B4_bgImage.loaded).toBe('1');
    expect(r.B4_playRejected).toEqual({ playing: false });
  });
});
