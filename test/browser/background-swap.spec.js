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

test.describe('Background events', () => {
  test('play, pause, mute and unmute follow the actual state', async ({ page }) => {
    let r = await result(page, 'background-events.html');

    expect(r.errors).toEqual([]);
    // Autoplay reports play once; pause()/play() report each change
    expect(r.videoAutoplay).toEqual(['play']);
    expect(r.videoPauseThenPlay).toEqual(['play', 'pause', 'play']);
    // Muted by default: mute() is no change; repeated unmute() fires once
    expect(r.videoMuteSequence).toEqual(['play', 'pause', 'play', 'unmute', 'mute']);
    // Loading a new source stops the video
    expect(r.videoSourceChange).toEqual(['play', 'pause', 'play', 'unmute', 'mute', 'pause']);
    // Nothing after destroy()
    expect(r.videoAfterDestroy).toEqual(r.videoSourceChange);
    // YouTube: duplicate PLAYING ignored; ENDED without loop is a pause
    expect(r.youtubeStates).toEqual(['play', 'pause', 'play', 'pause']);
    // A replaced player's events are ignored; the new player's are reported
    expect(r.youtubeReplacedIgnored).toEqual(['play', 'pause', 'play', 'pause', 'play']);
    // With loop, ENDED is followed by a replay, not a pause
    expect(r.youtubeLoopEnded).toEqual(['play']);
  });
});

test.describe('Swap aria option', () => {
  test('FS-3: aria-controls and aria-expanded follow toggles, groups, links, breakpoints and destroy()', async ({ page }) => {
    let r = await phases(page, 'swap-fs3-aria.html');

    // Only the non-button handle warns
    expect(r.warnings).toEqual(['Swap: Handle is not a <button>, so it may not be keyboard or screen reader operable']);

    expect(r.s1).toEqual([
      { controls: 'p1', expanded: 'false' },
      { controls: 'p1', expanded: 'true' },
      { controls: 'p1', expanded: 'false' },
    ]);

    // Targets without ids get one each; destroy() removes them and restores the original aria-expanded
    expect(r.s2.controls).toBe(r.s2.ids.join(' '));
    expect(r.s2Resolved).toEqual([true, true]);
    expect(r.s2Destroyed).toEqual({ controls: null, expanded: 'false', ids: ['', ''] });

    expect(r.group1).toEqual(['true', 'false']);
    expect(r.group2).toEqual(['false', 'true']);
    expect(r.linked).toEqual([{ controls: 'lp', expanded: 'true' }, { controls: 'lp', expanded: 'true' }]);

    // Off by default
    expect(r.s4).toEqual({ controls: null, expanded: null });

    // Removed while disabled by the breakpoint, added back when enabled again
    expect(r.s3Narrow.controls).toBe(r.s3Narrow.targetId);
    expect(r.s3Narrow.expanded).toBe('false');
    expect(r.s3Wide).toEqual({ controls: null, expanded: null, targetId: '', enabled: false });
    expect(r.s3NarrowAgain.controls).toBe(r.s3NarrowAgain.targetId);
  });

  test('FS-3: Navigation uses Swap aria; aria-controls still resolves after crossing the breakpoint', async ({ page }) => {
    let r = await phases(page, 'swap-fs3-aria.html');

    expect(r.navNarrow).toMatchObject({ expanded: 'false', resolves: true });
    expect(r.navWide).toEqual({ controls: null, expanded: null, navId: '' });
    expect(r.navNarrowAgain).toMatchObject({ expanded: 'false', resolves: true });
    expect([r.navOpen, r.navClosed]).toEqual(['true', 'false']);
    expect(r.navDestroyed).toEqual({ controls: null, expanded: null, navId: '' });
  });
});
