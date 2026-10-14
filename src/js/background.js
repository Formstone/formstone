/**
 * @fileoverview Background - Full-frame, responsive image and video backgrounds
 */

import MediaQuery from './mediaquery.js';
import {
  isFn,
  isObj,
  extend,
  falsey,
  //
  element,
  select,
  iterate,
  //
  on,
  once,
  trigger,
  afterTransition,
  //
  addClass,
  removeClass,
  //
  getAttr,
  setAttr,
} from './utils.js';

/**
 * Background class for creating full-frame responsive image and video backgrounds
 * @class
 */
class Background {

  /**
   * @type {number}
   * @private
   */
  static #_guid = 1;

  /**
   * Last playback state reported with background:play / background:pause
   * @type {boolean}
   * @private
   */
  #isPlaying = false;

  /**
   * @typedef {Object} BackgroundOptions
   * @property {boolean} [autoPlay=true] - Autoplay video
   * @property {boolean} [lazy=false] - Lazy load media on scroll
   * @property {string} [lazyOffset='100px'] - Distance from bottom of window for lazy loading
   * @property {boolean} [loop=true] - Loop video
   * @property {boolean} [mute=true] - Mute video
   * @property {string|Object} [source=null] - Source image (string or object) or video (object)
   * @property {Object} [youtubeOptions={}] - Options passed to YouTube player
   */

  /**
   * @type {BackgroundOptions}
   * @private
   */
  static #_defaults = {
    autoPlay: true,
    lazy: false,
    lazyOffset: '100px',
    loop: true,
    mute: true,
    source: null,
    youtubeOptions: {}
  };

  //

  /**
   * Sets default options for future Background instances
   * @param {BackgroundOptions} options - Object containing default options
   * @example
   * Background.defaults({
   *   lazy: true,
   *   lazyOffset: '10vh'
   * });
   */
  static defaults(options) {
    this.#_defaults = extend(true, this.#_defaults, options);
  }

  /**
   * Initializes Background plugin on target elements
   * @param {string} selector - Selector string to target
   * @param {BackgroundOptions} [options={}] - Object containing instance options
   * @returns {NodeList} NodeList of target elements
   * @example
   * Background.construct('.js-background');
   * Background.construct('.js-background', { lazy: true });
   */
  static construct(selector, options) {
    let targets = select(selector);

    iterate(targets, (el) => {
      if (!el.Background) {
        new Background(el, options);
      }
    });

    return targets;
  }

  //

  /**
   * Creates a new Background instance
   * @constructor
   * @param {Element} el - The target element
   * @param {BackgroundOptions} [options={}] - Configuration options
   */
  constructor(el, options) {
    if (el.Background) {
      console.warn('Background: Instance already exists', el);
      return;
    }

    // Parse JSON Options

    let optionsData = {};
    let dataset = el.dataset;

    try {
      optionsData = JSON.parse(dataset.backgroundOptions || '{}');
    } catch (e) {
      console.warn('Background: Error parsing options JSON', el);
    }

    // Internal Data

    Object.assign(this, extend(true, this.constructor.#_defaults, options || {}, optionsData));

    // Move the `mute` option to internal state so it doesn't shadow the mute() method
    this.muted = this.mute;

    delete this.mute;

    // Respect reduced motion; an explicit play() still plays
    if (this.autoPlay && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.autoPlay = false;
    }

    this.el = el;
    this.guid = this.constructor.#_guid++;
    this.guidClass = `fs-background-element-${this.guid}`;
    this.layerGuid = 0;

    //

    this.container = element('div');
    addClass(this.container, 'fs-background-container');
    setAttr(this.container, {
      'aria-hidden': 'true',
      'role': 'presentation',
      'tabindex': '-1',
    });

    el.append(this.container);
    addClass(el, 'fs-background', this.guidClass);

    if (this.lazy) {
      addClass(el, 'fs-background-lazy');

      this.observer = new IntersectionObserver((entries, observer) => {
        iterate(entries, (entry) => {
          this.#observe(entry);
        });
      }, {
        root: null,
        threshold: 0,
        rootMargin: `0px 0px ${this.lazyOffset} 0px`
      });

      this.observer.observe(el);
    } else {
      this.#initialLoad(this.source);
    }

    el.Background = this;
  }

  //

  /**
   * Removes plugin and all related data
   * @example
   * el.Background.destroy();
   */
  destroy() {
    this.destroyed = true;

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.#unbindSources();

    if (this.onLoadTimer) {
      clearTimeout(this.onLoadTimer);
      this.onLoadTimer = null;
    }

    if (this.player && isFn(this.player.destroy)) {
      this.player.destroy();
    }

    this.player = null;

    this.container.remove();

    removeClass(this.el, 'fs-background', 'fs-background-loaded', 'fs-background-lazy', this.guidClass);

    this.el.Background = null;

    delete this.el.Background;
  }

  //

  /**
   * Internal IntersectionObserver callback for lazy loading
   * @private
   * @param {IntersectionObserverEntry} entry - Intersection observer entry
   * @returns {void}
   */
  #observe(entry) {
    if (entry.isIntersecting) {
      this.observer.unobserve(this.el);
      this.observer = null;
      this.#initialLoad(this.source);
    }
  }

  /**
   * Performs the initial load of media
   * @private
   * @returns {void}
   */
  #initialLoad() {
    let source = this.source;
    this.source = '';
    this.load(source);
  }

  /**
   * Unbinds responsive image media queries
   * @private
   * @returns {void}
   */
  #unbindSources() {
    iterate(this.sources, (source) => {
      MediaQuery.unbind(source.key);
    });

    this.sources = null;
  }

  //

  /**
   * Loads new source media
   * @param {string|Object} source - Source image URL (string or responsive object) or video object
   * @fires background:loaded
   * @example
   * // Load single image
   * el.Background.load('/path/to/image.jpg');
   *
   * // Load responsive images
   * el.Background.load({
   *   0: '/path/to/small.jpg',
   *   740: '/path/to/large.jpg'
   * });
   *
   * // Load video
   * el.Background.load({
   *   mp4: '/path/to/video.mp4',
   *   poster: '/path/to/poster.jpg'
   * });
   *
   * // Load YouTube
   * el.Background.load({
   *   youtube: 'https://www.youtube.com/watch?v=VIDEO_ID'
   * });
   */
  load(source) {
    if (falsey(source) || source === '') {
      return;
    }

    addClass(this.el, 'fs-background-loaded');

    if (source !== this.source) {
      this.#unbindSources();

      // The current video stops when the source changes
      this.#setPlaying(false);
      this.videoEl = null;

      this.source = source;
      this.responsive = false;

      this.player = null;
      this.playerReady = false; // Set by YouTube onReady
      this.playing = false;

      this.isVideo = (isObj(source) && (!falsey(source.mp4) || !falsey(source.ogg) || !falsey(source.webm)));
      this.isYouTube = (!this.isVideo && isObj(source) && !!source.youtube);
      this.isImage = (!this.isVideo && !this.isYouTube);

      // Load Image

      if (this.isImage) {
        let newSource = source;

        // Responsive image handling
        if (isObj(source)) {
          let sources = [];
          let keys = [];

          iterate(Object.keys(source), (key) => {
            keys.push(key);
          });

          keys.sort((a, b) => {
            return parseInt(a, 10) - parseInt(b, 10);
          });

          for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let width = parseInt(key, 10);
            let mq = `(min-width: ${width}px)`;

            if (i + 1 < keys.length) {
              let maxWidth = parseInt(keys[i + 1], 10) - 1;

              mq = `(min-width: ${width}px) and (max-width: ${maxWidth}px)`;
            }

            let mqKey = `background-${this.guid}-${mq}`;

            sources.push({
              width: width,
              url: source[key],
              key: mqKey
            });

            MediaQuery.bind(mqKey, mq, {
              enter: () => {
                this.#loadImage(source[key]);
              }
            });
          }

          // Tracked for unbinding on reload / destroy
          this.sources = sources;
        } else {
          // Single image
          this.#loadImage(newSource);
        }
      }

      // Load Video

      if (this.isVideo) {
        this.#loadVideo(source);
      }

      // Load YouTube

      if (this.isYouTube) {
        this.#loadYouTube(source);
      }
    } else {
      trigger(this.el, 'background:loaded');
    }
  }

  //

  /**
   * Loads an image background
   * @private
   * @param {string} source - Image URL
   * @returns {void}
   */
  #loadImage(source) {
    this.layerGuid++;

    let media = element('div');

    media.ariaHidden = true;
    media.className = `fs-background-media fs-background-image`; // fs-background-layer-${this.layerGuid}`;
    media.style.opacity = 0;
    // Quote and escape so URLs with spaces, quotes or parentheses work
    media.style.backgroundImage = `url("${String(source).replace(/[\\"]/g, '\\$&').replace(/\n/g, '\\a ')}")`;

    setAttr(media, 'data-background-layer', this.layerGuid);

    this.container.append(media);

    let image = new Image();

    //

    image.onload = () => {
      this.#onLoad(media);
    };

    image.src = source;
  }

  //

  /**
   * Loads a video background
   * @private
   * @param {Object} source - Video source object containing mp4, webm, ogg, and poster URLs
   * @returns {void}
   */
  #loadVideo(source) {
    if (source.poster) {
      this.#loadImage(source.poster);
    }

    this.layerGuid++;

    let media = element('div');
    let video = element('video');

    this.videoEl = video;

    // Report actual playback (autoplay, refused play, end of video); ignore replaced videos
    on(video, 'playing', () => {
      if (video === this.videoEl) {
        this.#setPlaying(true);
      }
    });

    on(video, 'pause', () => {
      if (video === this.videoEl) {
        this.#setPlaying(false);
      }
    });

    media.ariaHidden = true;
    media.className = 'fs-background-media fs-background-video';
    media.style.opacity = 0;

    setAttr(media, 'data-background-layer', this.layerGuid);

    setAttr(video, {
      'playsinline': 'true',
      'preload': 'auto',
      'role': 'presentation',
      'tabindex': '-1',
    });

    if (this.loop) {
      video.loop = true;
    }
    if (this.muted) {
      video.muted = true;
    }
    if (this.autoPlay) {
      video.autoplay = true;
    }

    if (source.webm) {
      let src = element('source');
      src.type = 'video/webm';
      src.src = source.webm;

      video.append(src);
    }
    if (source.mp4) {
      let src = element('source');
      src.type = 'video/mp4';
      src.src = source.mp4;

      video.append(src);
    }
    if (source.ogg) {
      let src = element('source');
      src.type = 'video/ogg';
      src.src = source.ogg;

      video.append(src);
    }

    //

    once(video, 'loadeddata', (e) => {
      this.#onLoad(media);

      if (this.autoPlay) {
        this.play();
      }
    });

    media.append(video);
    this.container.append(media);

    this.source = source;
  }

  //

  /**
   * Loads a YouTube video background
   * @private
   * @param {Object} source - Source object containing youtube URL and optional poster
   * @returns {void}
   */
  #loadYouTube(source) {
    let id = parseYouTubeId(source.youtube);

    if (!id) {
      console.warn('Background: Unrecognized YouTube URL', source.youtube, this.el);

      return;
    }

    this.youTubeId = id;

    let ytURL = 'youtube.com';

    // Don't mutate the caller's source object
    this.#loadImage(source.poster || `//img.${ytURL}/vi/${id}/maxresdefault.jpg`);

    this.layerGuid++;

    let layer = this.layerGuid;

    whenYouTubeReady(() => {
      // Skip if destroyed or a different source was loaded while waiting for the API
      if (this.destroyed || this.source !== source) {
        return;
      }

      this.#createPlayer(layer, ytURL);
    });
  }

  /**
   * Creates the YouTube player once the API is ready
   * @private
   * @param {number} layer - Layer guid reserved for the embed
   * @param {string} ytURL - YouTube domain
   * @returns {void}
   */
  #createPlayer(layer, ytURL) {
    let guid = `fs-background-${this.guid}-${layer}`;
    let media = element('div');
    let video = element('div');

    video.id = guid;

    media.ariaHidden = true;
    media.className = 'fs-background-media fs-background-embed';
    media.style.opacity = 0;

    setAttr(media, 'data-background-layer', layer);

    media.append(video);
    this.container.append(media);

    let options = extend(true, {}, {
      controls: 0,
      rel: 0,
      showinfo: 0,
      wmode: 'transparent',
      enablejsapi: 1,
      version: 3,
      playerapiid: guid,
      loop: (this.loop) ? 1 : 0,
      mute: 1,
      origin: `${window.location.protocol}//${window.location.host}`
    }, this.youtubeOptions, {
      autoplay: 1 // Must be enabled for initial API callbacks to fire
    });

    this.player = new window.YT.Player(guid, {
      host: `https://www.${ytURL.replace('.com', '-nocookie.com')}`,
      videoId: this.youTubeId,
      playerVars: options,
      events: {
        onReady: (e) => {
          let iframe = select('iframe', this.container);

          setAttr(iframe, {
            'role': 'presentation',
            'tabindex': '-1',
          });

          this.playerReady = true;

          if (this.muted) {
            this.player.mute();
          }

          if (this.autoPlay) {
            this.player.playVideo();
          } else {
            this.player.pauseVideo();
          }
        },
        onStateChange: (e) => {
          // Ignore players replaced by a newer load()
          if (e.target && e.target !== this.player) {
            return;
          }

          // -1 = unstarted
          //  0 = ended
          //  1 = playing
          //  2 = paused
          //  3 = buffering
          //  5 = cued

          if (!this.playing && e.data === window.YT.PlayerState.PLAYING) {
            this.playing = true;

            this.#onLoad(media);
          } else if (this.loop && this.playing && e.data === window.YT.PlayerState.ENDED) {
            // fix looping option
            this.player.playVideo();
          }

          let state = window.YT.PlayerState;

          if (e.data === state.PLAYING) {
            this.#setPlaying(true);
          } else if (e.data === state.PAUSED || (e.data === state.ENDED && !this.loop)) {
            this.#setPlaying(false);
          }
        }
      }
    });
  }

  //

  /**
   * Plays current video
   * @example
   * el.Background.play();
   */
  play() {
    if (this.isYouTube) {
      if (this.playerReady) {
        this.player.playVideo();
      } else {
        // Applied by onReady; `playing` is left to onStateChange so the layer still fades in
        this.autoPlay = true;

        return;
      }
    } else if (this.isVideo) {
      if (this.videoEl) {
        let promise = this.videoEl.play();

        // Playback can be refused (e.g. unmuted autoplay); reflect that instead of an unhandled rejection
        if (promise && isFn(promise.catch)) {
          promise.catch(() => {
            this.playing = false;
          });
        }
      }
    }

    this.playing = true;
  }

  /**
   * Pauses current video
   * @example
   * el.Background.pause();
   */
  pause() {
    if (this.isYouTube) {
      if (this.playerReady) {
        this.player.pauseVideo();
      } else {
        // Applied by onReady
        this.autoPlay = false;

        return;
      }
    } else if (this.isVideo) {
      if (this.videoEl) {
        this.videoEl.pause();
      }
    }

    this.playing = false;
  }

  /**
   * Mutes current video
   * @example
   * el.Background.mute();
   */
  mute() {
    let changed = !this.muted;

    if (this.isYouTube && this.playerReady) {
      this.player.mute();
    } else if (this.isVideo) {
      if (this.videoEl) {
        this.videoEl.muted = true;
      }
    }

    this.muted = true;

    if (changed) {
      trigger(this.el, 'background:mute');
    }
  }

  /**
   * Unmutes current video
   * @example
   * el.Background.unmute();
   */
  unmute() {
    if (this.isYouTube && this.playerReady) {
      this.player.unMute();

      if (this.playing) {
        this.player.playVideo();
      }
    } else if (this.isVideo) {
      if (this.videoEl) {
        this.videoEl.muted = false;
      }
    }

    let changed = this.muted;

    this.muted = false;

    if (changed) {
      trigger(this.el, 'background:unmute');
    }
  }

  //

  /**
   * Updates the playback state and fires background:play or background:pause when it changes
   * @private
   * @param {boolean} playing - Whether media is playing
   * @returns {void}
   * @fires background:play
   * @fires background:pause
   */
  #setPlaying(playing) {
    if (this.destroyed || playing === this.#isPlaying) {
      return;
    }

    this.#isPlaying = playing;

    trigger(this.el, playing ? 'background:play' : 'background:pause');
  }

  /**
   * Handles media load completion
   * @private
   * @param {Element} media - The loaded media element
   * @returns {void}
   * @fires background:loaded
   */
  #onLoad(media) {
    let layer = getAttr(media, 'data-background-layer');

    afterTransition(media, () => {
      if (this.onLoadTimer) {
        clearTimeout(this.onLoadTimer);
        this.onLoadTimer = null;
      }

      this.onLoadTimer = setTimeout(() => {
        let extra = select(`div:not([data-background-layer="${layer}"]):not([data-background-layer="${this.layerGuid}"])`, this.container);

        iterate(extra, (node) => {
          node.remove();
        });
      }, 500);
    });

    media.style.opacity = 1;

    trigger(this.el, 'background:loaded');
  }

};

// YouTube Helpers

/**
 * Callbacks waiting for the YouTube IFrame API
 * @type {Function[]}
 * @private
 */
let YouTubeQueue = [];

/**
 * Extracts a YouTube video ID from a URL or a bare 11 character ID
 * @private
 * @param {string} url - YouTube URL or video ID
 * @returns {string|null} Video ID, or null when unrecognized
 */
function parseYouTubeId(url) {
  if (typeof url !== 'string') {
    return null;
  }

  if (/^[\w-]{11}$/.test(url)) {
    return url;
  }

  let parts = url.match(/(?:(?:youtube\.com|youtube-nocookie\.com)\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);

  return parts ? parts[1] : null;
}

/**
 * Checks whether the YouTube IFrame API is loaded
 * @private
 * @returns {boolean} True when YT.Player is available
 */
function isYouTubeReady() {
  return !!(window.YT && isFn(window.YT.Player));
}

/**
 * Runs queued callbacks once the YouTube IFrame API is ready; safe to call more than once
 * @private
 * @returns {void}
 */
function onYouTubeReady() {
  let queue = YouTubeQueue;

  YouTubeQueue = [];

  iterate(queue, (cb) => {
    cb.call();
  });
}

/**
 * @type {boolean}
 * @private
 */
let YouTubeHooked = false;

/**
 * Chains onto the global YouTube API callback; done on first use, not at import, so the module
 * can be imported without a window (SSR)
 * @private
 * @returns {void}
 */
function hookYouTubeCallback() {
  if (YouTubeHooked) {
    return;
  }

  YouTubeHooked = true;

  let originalYouTubeCallback = window.onYouTubeIframeAPIReady;

  window.onYouTubeIframeAPIReady = () => {
    if (isFn(originalYouTubeCallback)) {
      originalYouTubeCallback.call();
    }

    onYouTubeReady();
  };
}

/**
 * Executes a callback once the YouTube IFrame API is ready, loading the API if needed
 * @private
 * @param {Function} cb - Callback function
 * @returns {void}
 */
function whenYouTubeReady(cb) {
  hookYouTubeCallback();

  if (isYouTubeReady()) {
    cb.call();

    return;
  }

  YouTubeQueue.push(cb);

  let script = select('script[src*="youtube.com/iframe_api"]')[0];

  if (!script) {
    script = element('script');
    script.src = 'https://www.youtube.com/iframe_api';

    document.head.append(script);
  }

  // Don't rely only on the global callback, which other scripts may overwrite
  let ready = () => {
    if (window.YT && isFn(window.YT.ready)) {
      window.YT.ready(onYouTubeReady);
    }
  };

  once(script, 'load', ready);
  ready();
}

// Export

export default Background;