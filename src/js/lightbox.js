/**
 * @fileoverview Lightbox - Accessible lightbox for images, videos, and elements
 * Accessibility based on https://plousia.com/blog/how-create-accessible-mobile-menu
 * Updated with work by @nhall
 */

import {
  extend,
  isU,
  //
  element,
  select,
  iterate,
  //
  append,
  //
  on,
  off,
  once,
  trigger,
  afterTransition,
  //
  addClass,
  removeClass,
  hasClass,
  //
  getAttr,
  setAttr,
  removeAttr,
} from './utils.js';

// Formatters

function formatYouTube(parts) {
  return '//www.youtube.com/embed/' + parts[2];
}

function formatVimeo(parts) {
  return '//player.vimeo.com/video/' + parts[3];
}

// Zoom step for buttons and keys, and the largest step for one wheel event
const ZOOM_STEP = 1.5;

/**
 * Clamps a pan offset; centers (0) when the range is empty because the image doesn't fill the view
 * @param {number} value - Offset
 * @param {number} min - Minimum offset
 * @param {number} max - Maximum offset
 * @returns {number} Clamped offset
 */
function clampPan(value, min, max) {
  return (min > max) ? 0 : Math.min(Math.max(value, min), max);
}

let LightboxInstance;

/**
 * @typedef {Object} LightboxOptions
 * @property {string} [direction=null] - Content direction ('ltr' or 'rtl'); defaults to `document.dir` when the instance is created
 * @property {string} [customClass=''] - Custom CSS class to add to lightbox dialog
 * @property {string} [label='Gallery'] - Accessibility label for the lightbox
 * @property {RegExp} [fileTypes=/\.(jpe?g|sjpg|png|gif|webp|avif|svg)(?=$|[?#])/i] - Regular expression to match image file extensions (at the end of the path)
 * @property {number} [threshold=50] - Swipe threshold in pixels for touch navigation
 * @property {boolean} [loop=false] - Loop from the last gallery item to the first (and back)
 * @property {boolean} [ordinal=true] - Show gallery position indicator (e.g., "1 of 5")
 * @property {boolean} [zoom=true] - Allow zooming images (double-tap, pinch, buttons and keys)
 * @property {number} [zoomMax=4] - Maximum zoom; also capped at the image's full resolution, but always at least 2
 * @property {Object} [templates] - HTML templates for lightbox components
 * @property {Object} [videoProviders] - Video provider patterns and URL formatters for YouTube and Vimeo
 */

/**
 * Lightbox class for displaying images, videos, and inline elements
 * @class
 */
class Lightbox {

  static #_guid = 1;

  static #_defaults = {
    direction: null,
    customClass: '',
    label: 'Gallery',
    fileTypes: /\.(jpe?g|sjpg|png|gif|webp|avif|svg)(?=$|[?#])/i,
    loop: false,
    threshold: 50,
    ordinal: true,
    zoom: true,
    zoomMax: 4,
    templates: {
      container: `
<dialog class="fs-lightbox">
  <div class="fs-lightbox-loading" role="status">[loading]</div>
  <button type="button" class="fs-lightbox-close" autofocus>[close]</button>
  <button type="button" class="fs-lightbox-zoom fs-lightbox-zoom_out">[zoomOut]</button>
  <button type="button" class="fs-lightbox-zoom fs-lightbox-zoom_in">[zoomIn]</button>
  <div class="fs-lightbox-container"></div>
  <button type="button" class="fs-lightbox-control fs-lightbox-control_previous">[previous]</button>
  <button type="button" class="fs-lightbox-control fs-lightbox-control_next">[next]</button>
  <div class="fs-lightbox-status fs-lightbox-sr" aria-live="polite" aria-atomic="true"></div>
</dialog>`,
      close: `<span class="fs-lightbox-sr">Close</span><svg viewBox="-6 -6 24 24" fill="currentColor"><path d="M7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485 2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535 3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z"></path></svg>`,
      loading: '<span class="fs-lightbox-sr">Loading</span>',
      previous: `<span class="fs-lightbox-sr">Previous</span><svg viewBox="-5 -5 24 24" fill="currentColor"><path d="M3.414 7.657l3.95 3.95A1 1 0 0 1 5.95 13.02L.293 7.364a.997.997 0 0 1 0-1.414L5.95.293a1 1 0 1 1 1.414 1.414l-3.95 3.95H13a1 1 0 0 1 0 2H3.414z"></path></svg>`,
      next: `<span class="fs-lightbox-sr">Next</span><svg viewBox="-5 -5 24 24" fill="currentColor"><path d="M10.586 5.657l-3.95-3.95A1 1 0 0 1 8.05.293l5.657 5.657a.997.997 0 0 1 0 1.414L8.05 13.021a1 1 0 1 1-1.414-1.414l3.95-3.95H1a1 1 0 1 1 0-2h9.586z"></path></svg>`,
      zoomIn: `<span class="fs-lightbox-sr">Zoom in</span><svg viewBox="-2 -2 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="M15.5 15.5L20 20M7.5 10.5h6M10.5 7.5v6"></path></svg>`,
      zoomOut: `<span class="fs-lightbox-sr">Zoom out</span><svg viewBox="-2 -2 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="M15.5 15.5L20 20M7.5 10.5h6"></path></svg>`,
      ordinal: `<span class="current">[current]</span> of <span class="total">[total]</span>`
    },
    videoProviders: {
      youtube: {
        pattern: /^(?:(?:https|http):\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com).*?(?:\/|v\/|u\/|embed\/|shorts\/|watch\?v=|(?<username>user\/))(?<id>[\w\-]{11})(?:\?|&|$)/,
        format: formatYouTube
      },
      vimeo: {
        pattern: /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/,
        format: formatVimeo
      }
    }
  };

  /**
   * Sets default options for future Lightbox instances
   * @param {LightboxOptions} options - Object containing default options
   * @example
   * Lightbox.defaults({
   *   customClass: 'my-lightbox',
   *   threshold: 100
   * });
   */
  static defaults(options) {
    this.#_defaults = extend(true, this.#_defaults, options);
  }

  /**
   * Zoom state of the active image; `item` is set while it's zoomed in
   * @type {{ item: Object|null, scale: number, x: number, y: number }}
   * @private
   */
  #zoom = {
    item: null,
    scale: 1,
    x: 0,
    y: 0
  };

  /**
   * Active pointers by id, for swipes, pans and pinches
   * @type {Map<number, { x: number, y: number }>}
   * @private
   */
  #pointers = new Map();

  /**
   * Current pointer gesture: null (maybe a tap), 'swipe', 'pan', 'pinch', or 'pinched' (one finger left at 1x)
   * @type {string|null}
   * @private
   */
  #gesture = null;

  /**
   * Pointer and zoom state when the current gesture (re)started
   * @type {Object}
   * @private
   */
  #start = {};

  /**
   * Last tap, for double-tap zoom
   * @type {{ x: number, y: number, time: number }|null}
   * @private
   */
  #lastTap = null;

  /**
   * @static
   * @param {string} selector - CSS selector string to target elements (typically links)
   * @param {LightboxOptions} [options] - Instance-specific options
   * @returns {Array<Element>} Array of initialized elements
   * @description Initializes Lightbox on all elements matching the selector. Each element
   * should be a link (anchor tag) pointing to the media to display. Skips elements that
   * already have Lightbox initialized.
   * @example
   * // Initialize on all links with class 'lightbox'
   * Lightbox.construct('.lightbox');
   *
   * // Initialize with options
   * Lightbox.construct('.gallery', {
   *   customClass: 'photo-gallery',
   *   threshold: 100
   * });
   */
  static construct(selector, options) {
    let targets = select(selector);

    iterate(targets, (el) => {
      if (!el.Lightbox) {
        new Lightbox(el, options);
      }
    });

    return targets;
  }

  //

  /**
   * Creates a new Lightbox instance
   * @constructor
   * @param {Element} el - The target element
   * @param {LightboxOptions} [options={}] - Configuration options
   */
  constructor(el, options) {
    if (el.Lightbox) {
      console.warn('Lightbox: Instance already exists', el);
      return;
    }

    // Parse JSON Options

    let optionsData = {};
    let dataset = el.dataset;

    try {
      optionsData = JSON.parse(dataset.lightboxOptions || '{}');
    } catch (e) {
      console.warn('Lightbox: Error parsing options JSON', el);
    }

    // Internal Data

    Object.assign(this, extend(true, this.constructor.#_defaults, options || {}, optionsData));

    this.el = el;
    this.guid = this.constructor.#_guid++;
    this.guidClass = `fs-lightbox-element-${this.guid}`;
    this.gallery = dataset.lightboxGallery || null;
    this.isOpen = false;
    this.isTouching = false;
    this.isDragging = false;
    this.isRTL = (this.direction || document.dir) == 'rtl';

    // Enhance trigger

    this.originalRole = getAttr(this.el, 'role');
    this.originalHaspopup = getAttr(this.el, 'aria-haspopup');
    this.originalLabel = getAttr(this.el, 'aria-label');

    addClass(this.el, this.guidClass);

    setAttr(this.el, {
      role: 'button',
      'aria-haspopup': 'dialog'
    });

    if (!getAttr(this.el, 'aria-label') && !getAttr(this.el, 'aria-labelledby')) {
      let img = select('img', this.el)[0];
      let label = dataset.lightboxCaption || (img ? getAttr(img, 'alt') : null) || 'Open Lightbox';

      setAttr(this.el, 'aria-label', label);
    }

    on(this.el, 'click', this.#onClick);
    on(this.el, 'keydown', this.#onTriggerKeyDown);

    el.Lightbox = this;
  }

  //

  /**
   * @public
   * @description Destroys the Lightbox instance, removing all event listeners and data.
   * Automatically closes the lightbox if open. Cleans up the element and removes the
   * Lightbox property.
   * @example
   * el.Lightbox.destroy();
   */
  destroy() {
    this.close();

    removeClass(this.el, this.guidClass);

    setAttr(this.el, {
      role: this.originalRole || false,
      'aria-haspopup': this.originalHaspopup || false,
      'aria-label': this.originalLabel || false
    });

    off(this.el, 'click', this.#onClick);
    off(this.el, 'keydown', this.#onTriggerKeyDown);

    this.el.Lightbox = null;

    delete this.el.Lightbox;
  }

  //

  /**
   * Opens lightbox instance at specified index
   * @param {number} [index] - Optional index to open (defaults to trigger's position)
   * @example
   * el.Lightbox.open();
   * el.Lightbox.open(2);
   */
  open(index) {
    let promise = LightboxInstance ? LightboxInstance.close() : Promise.resolve();

    promise.then(() => {
      if (this.isOpen) {
        return;
      }

      this.index = index;

      this.#buildItems();

      if (!this.items.length) {
        console.warn('Lightbox: No items to display', this.el);

        return;
      }

      this.maxIndex = this.items.length - 1;

      this.#checkIndex();

      this.#zoom = {
        item: null,
        scale: 1,
        x: 0,
        y: 0
      };
      this.#pointers.clear();
      this.#gesture = null;
      this.#lastTap = null;

      this.listeners = {
        'close': this.#onClose(),
        'next': this.#onNext(),
        'previous': this.#onPrevious(),
        'container': this.#onContainerClick(),
        'keydown': this.#onKeyDown(),
        'pointerdown': this.#onPointerDown(),
        'pointermove': this.#onPointerMove(),
        'pointerup': this.#onPointerUp(),
        'clickblock': this.#onClickBlock(),
        'zoomin': this.#onZoomIn(),
        'zoomout': this.#onZoomOut(),
        'wheel': this.#onWheel(),
        'resize': this.#onResize(),
      };

      this.#draw();

      if (typeof this.lightboxEl.showModal === 'function') {
        this.lightboxEl.showModal();
      }

      this.#setPositions();

      setTimeout(() => {
        addClass(this.lightboxEl, 'fs-lightbox-open');

        this.isOpen = true;

        // Images only zoom once open
        this.#updateZoom();

        LightboxInstance = this;

        // On the trigger element (like other components) and the window
        trigger([this.el, window], 'lightbox:open', {
          el: this.el
        });
      }, 10);
    });
  }

  /**
   * Closes active lightbox instance
   * @returns {Promise} Promise that resolves when the close transition completes (immediately if not open)
   * @example
   * el.Lightbox.close();
   */
  close() {
    if (!this.isOpen) {
      return Promise.resolve();
    }

    // Fixes 'stuck' instance
    if (!hasClass(this.lightboxEl, 'fs-lightbox-open')) {
      this.#cleanUp();

      return Promise.resolve();
    }

    removeClass(this.lightboxEl, 'fs-lightbox-open');

    this.#unbindWindow();

    return new Promise((resolve) => {
      afterTransition(this.lightboxEl, () => {
        this.#cleanUp();

        resolve(this.el);
      });
    });
  }

  /**
   * Removes the window listeners added while open
   * @private
   * @returns {void}
   */
  #unbindWindow() {
    off(window, 'keydown', this.listeners.keydown);
    off(window, 'lightbox:previous', this.listeners.previous);
    off(window, 'lightbox:next', this.listeners.next);
    off(window, 'lightbox:close', this.listeners.close);
    off(window, 'resize', this.listeners.resize);
  }

  /**
   * Cleans up lightbox state and restores moved content
   * @private
   * @returns {void}
   */
  #cleanUp() {
    // Also covers the 'stuck' path in close(), which skips the transition
    this.#unbindWindow();

    this.#pointers.clear();
    this.#gesture = null;

    iterate(this.items, (item, index) => {
      if (item.isElement) {
        item.targetEl.append(...item.frameEl.childNodes);
      }
    });

    if (typeof this.lightboxEl.close === 'function') {
      this.lightboxEl.close();
    }

    this.lightboxEl.remove();

    this.isOpen = false;

    // On the trigger element (like other components) and the window
    trigger([this.el, window], 'lightbox:close', {
      el: this.el
    });

    LightboxInstance = null;
  }

  //

  /**
   * Advances to next gallery item
   * @example
   * el.Lightbox.next();
   */
  next() {
    this.index++;
    this.#checkIndex();

    this.#setPositions();
  }

  /**
   * Goes back to previous gallery item
   * @example
   * el.Lightbox.previous();
   */
  previous() {
    this.index--;
    this.#checkIndex();

    this.#setPositions();
  }

  /**
   * Jumps to specific gallery index
   * @param {number} index - Target index
   * @example
   * el.Lightbox.jump(3);
   */
  jump(index) {
    this.index = index;
    this.#checkIndex();

    this.#setPositions();
  }

  //

  /**
   * Zooms the active image in one step, keeping the center of the view in place
   * @example
   * el.Lightbox.zoomIn();
   */
  zoomIn() {
    this.#zoomTo(this.#zoom.scale * ZOOM_STEP);
  }

  /**
   * Zooms the active image out one step
   * @example
   * el.Lightbox.zoomOut();
   */
  zoomOut() {
    this.#zoomTo(this.#zoom.scale / ZOOM_STEP);
  }

  /**
   * Resets the active image to its fitted size
   * @example
   * el.Lightbox.zoomReset();
   */
  zoomReset() {
    this.#resetZoom();
  }

  //

  /**
   * Builds item metadata from matching gallery elements
   * @private
   * @returns {void}
   */
  #buildItems() {
    this.selector = this.gallery ? `[data-lightbox-gallery="${CSS.escape(this.gallery)}"]` : `.${this.guidClass}`;

    let targets = select(this.selector);

    this.items = [];

    iterate(targets, (el) => {
      if (el.tagName === 'A') {
        let url = window.location.href.replace(window.location.hash, '');
        let hash = el.hash;
        let source = el.href.replace(hash, '');
        let type = el.dataset.lightboxType || '';
        let isImage = (type === 'image') || this.#checkImage(source);
        let isVideo = (type === 'video') || !!this.#checkVideo(source);
        let isElement = (type === 'element') || (!isImage && !isVideo && (source.indexOf(url) > -1 && hash.substr(0, 1) === '#'));
        let isIframe = (type === 'url') || (!isImage && !isVideo && !isElement && source.substr(0, 4) === 'http');

        // Only load http(s) pages in iframes (never javascript:, data:, etc.)
        if (isIframe && !/^https?:$/i.test(el.protocol)) {
          console.warn(`Lightbox: Unsupported URL ${el.href}`, el);

          return;
        }

        let targetEl = isElement ? this.#getTarget(hash) : null;

        if (isElement && !targetEl) {
          console.warn(`Lightbox: Target ${hash} not found`, el);

          return;
        }

        // Default to the trigger's position when no index is passed to open()
        if (isU(this.index) && el == this.el) {
          this.index = this.items.length;
        }

        this.items.push({
          index: this.items.length,
          source: el.href,
          hash: hash,
          targetEl: targetEl,
          isLoaded: false,
          isImage: isImage,
          isVideo: isVideo,
          isIframe: isIframe,
          isElement: isElement,
          caption: el.dataset.lightboxCaption || getAttr(el, 'title'),
        });
      }
    });
  }

  //

  /**
   * Renders lightbox UI and binds event listeners
   * @private
   * @returns {void}
   */
  #draw() {
    let html = this.templates.container
      .replace('[close]', this.templates.close)
      .replace('[loading]', this.templates.loading)
      .replace('[previous]', this.templates.previous)
      .replace('[next]', this.templates.next)
      .replace('[zoomIn]', this.templates.zoomIn)
      .replace('[zoomOut]', this.templates.zoomOut);

    let template = element('template');

    template.innerHTML = html.trim();

    // Keep a reference to this dialog rather than querying the page for one
    this.lightboxEl = template.content.firstElementChild;

    document.body.append(this.lightboxEl);

    this.closeEl = select('.fs-lightbox-close', this.lightboxEl)[0];
    this.zoomInEl = select('.fs-lightbox-zoom_in', this.lightboxEl)[0];
    this.zoomOutEl = select('.fs-lightbox-zoom_out', this.lightboxEl)[0];
    this.loadingEl = select('.fs-lightbox-loading', this.lightboxEl)[0];
    this.containerEl = select('.fs-lightbox-container', this.lightboxEl)[0];
    this.statusEl = select('.fs-lightbox-status', this.lightboxEl)[0];
    this.controlPreviousEl = select('.fs-lightbox-control_previous', this.lightboxEl)[0];
    this.controlNextEl = select('.fs-lightbox-control_next', this.lightboxEl)[0];

    addClass(this.lightboxEl, this.customClass);
    setAttr(this.lightboxEl, 'aria-label', this.label);

    if (this.isRTL) {
      addClass(this.lightboxEl, `fs-lightbox-rtl`);
    }

    if (this.items.length > 1) {
      addClass(this.lightboxEl, 'fs-lightbox-gallery');
    }

    iterate(this.items, (item, index) => {
      if (item.isImage) {
        this.#drawImage(item, index);
      }
      if (item.isVideo) {
        this.#drawVideo(item, index);
      }
      if (item.isIframe) {
        this.#drawIframe(item, index);
      }
      if (item.isElement) {
        this.#drawElement(item, index);
      }
    });

    // Swipes (galleries) and zoom gestures; a second finger may land outside the image
    if (this.items.length > 1 || this.zoom) {
      on(this.containerEl, 'pointerdown', this.listeners.pointerdown);
    }

    if (this.zoom) {
      on(this.containerEl, 'wheel', this.listeners.wheel, {
        passive: false
      });
    }

    // Custom container templates may leave the zoom buttons out
    if (this.zoomInEl) {
      on(this.zoomInEl, 'click', this.listeners.zoomin);
    }
    if (this.zoomOutEl) {
      on(this.zoomOutEl, 'click', this.listeners.zoomout);
    }

    once(this.closeEl, 'click', this.listeners.close);
    on(this.controlPreviousEl, 'click', this.listeners.previous);
    on(this.controlNextEl, 'click', this.listeners.next);
    on(this.containerEl, 'click', this.listeners.container);
    // Escape: keep the dialog modal through the close transition instead of the native instant
    // close (if the browser makes cancel non-cancelable, close() still cleans up after it)
    on(this.lightboxEl, 'cancel', (e) => {
      e.preventDefault();

      this.close();
    });
    on(window, 'keydown', this.listeners.keydown);
    on(window, 'lightbox:previous', this.listeners.previous);
    on(window, 'lightbox:next', this.listeners.next);
    on(window, 'lightbox:close', this.listeners.close);
    on(window, 'resize', this.listeners.resize);
  }

  //

  /**
   * Renders image item markup
   * @private
   * @param {Object} item - Item data object
   * @param {number} index - Item index
   * @returns {void}
   */
  #drawImage(item, index) {
    let itemEl = element('div');
    let wrapEl = element('div');
    let mediaEl = element('div');
    let imgEl = element('img');

    addClass(itemEl, 'fs-lightbox-item', `fs-lightbox-item_${index}`);
    addClass(wrapEl, 'fs-lightbox-wrap');
    addClass(mediaEl, 'fs-lightbox-media', 'fs-lightbox-media_image');
    addClass(imgEl, 'fs-lightbox-image');

    setAttr(imgEl, {
      'data-src': item.source,
      'draggable': 'false',
      'alt': item.caption || '',
    });

    mediaEl.append(imgEl);
    wrapEl.append(mediaEl);
    itemEl.append(wrapEl);

    this.#checkDetails(item, itemEl);

    this.containerEl.append(itemEl);

    item.el = itemEl;
    item.mediaEl = mediaEl;
    item.imageEl = imgEl;
  }

  /**
   * Renders video item markup
   * @private
   * @param {Object} item - Item data object
   * @param {number} index - Item index
   * @returns {void}
   */
  #drawVideo(item, index) {
    let url = this.#checkVideo(item.source);
    let qs = item.source.split('?');
    let parts = [
      '&origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.hostname),
      '&enablejsapi=1'
    ];

    if (qs.length >= 2) {
      parts.push(qs.slice(1)[0].trim());
    }

    let source = `${url}?${parts.join('&')}`;

    let itemEl = element('div');
    let wrapEl = element('div');
    let mediaEl = element('div');
    let frameEl = element('div');
    let iframeEl = element('iframe');

    addClass(itemEl, 'fs-lightbox-item', `fs-lightbox-item_${index}`);
    addClass(wrapEl, 'fs-lightbox-wrap');
    addClass(mediaEl, 'fs-lightbox-media', 'fs-lightbox-media_video');
    addClass(frameEl, 'fs-lightbox-video');

    setAttr(iframeEl, {
      'frameborder': '0',
      'seamless': 'seamless',
      'allowfullscreen': '',
      'allow': 'autoplay; encrypted-media',
      'referrerpolicy': 'strict-origin-when-cross-origin',
      'data-src': source,
      'title': item.caption || 'Lightbox Video',
    });

    frameEl.append(iframeEl);
    mediaEl.append(frameEl);
    wrapEl.append(mediaEl);
    itemEl.append(wrapEl);

    this.#checkDetails(item, itemEl);

    this.containerEl.append(itemEl);

    item.el = itemEl;
    item.mediaEl = mediaEl;
  }

  /**
   * Renders iframe item markup
   * @private
   * @param {Object} item - Item data object
   * @param {number} index - Item index
   * @returns {void}
   */
  #drawIframe(item, index) {
    let itemEl = element('div');
    let wrapEl = element('div');
    let mediaEl = element('div');
    let frameEl = element('div');
    let iframeEl = element('iframe');

    addClass(itemEl, 'fs-lightbox-item', `fs-lightbox-item_${index}`);
    addClass(wrapEl, 'fs-lightbox-wrap');
    addClass(mediaEl, 'fs-lightbox-media', 'fs-lightbox-media_iframe');
    addClass(frameEl, 'fs-lightbox-iframe');

    setAttr(iframeEl, {
      'frameborder': '0',
      'seamless': 'seamless',
      'data-src': item.source,
      'title': item.caption || 'Lightbox iFrame',
    });

    frameEl.append(iframeEl);
    mediaEl.append(frameEl);
    wrapEl.append(mediaEl);
    itemEl.append(wrapEl);

    this.#checkDetails(item, itemEl);

    this.containerEl.append(itemEl);

    item.el = itemEl;
    item.mediaEl = mediaEl;
    item.frameEl = frameEl;
  }

  /**
   * Renders inline element item markup
   * @private
   * @param {Object} item - Item data object
   * @param {number} index - Item index
   * @returns {void}
   */
  #drawElement(item, index) {
    let itemEl = element('div');
    let wrapEl = element('div');
    let mediaEl = element('div');
    let frameEl = element('div');

    addClass(itemEl, 'fs-lightbox-item', `fs-lightbox-item_${index}`, 'fs-lightbox-loaded');
    addClass(wrapEl, 'fs-lightbox-wrap');
    addClass(mediaEl, 'fs-lightbox-media', 'fs-lightbox-media_element');
    addClass(frameEl, 'fs-lightbox-element');

    frameEl.append(...item.targetEl.childNodes);
    mediaEl.append(frameEl);
    wrapEl.append(mediaEl);
    itemEl.append(wrapEl);

    this.#checkDetails(item, itemEl);

    this.containerEl.append(itemEl);

    item.isLoaded = true;

    item.el = itemEl;
    item.mediaEl = mediaEl;
    item.frameEl = frameEl;
  }

  //

  /**
   * Updates item classes and media load states for current index
   * @private
   * @returns {void}
   */
  #setPositions() {
    this.#resetZoom();

    iterate(this.items, (item, index) => {
      removeClass(item.el, 'fs-lightbox-active', 'fs-lightbox-item_previous', 'fs-lightbox-item_next');

      if (index === this.index) {
        addClass(item.el, 'fs-lightbox-active');

        item.el.inert = false;

        if (!item.isLoaded) {
          this.#showLoading();

          this.#loadItem(item, index);
        } else {
          this.#hideLoading();
        }

        this.#updateStatus();
      } else {
        afterTransition(item.el, () => {
          this.#unloadItem(item, index);
        });

        item.el.inert = true;
      }

      if (this.loop && this.index == this.maxIndex && index == 0) {
        addClass(item.el, 'fs-lightbox-item_next');
      } else if (this.loop && this.index == 0 && index == this.maxIndex) {
        addClass(item.el, 'fs-lightbox-item_previous');
      } else if (index < this.index) {
        addClass(item.el, 'fs-lightbox-item_previous');
      } else if (index > this.index) {
        addClass(item.el, 'fs-lightbox-item_next');
      }
    });

    if (!this.loop) {
      this.#setDisabled(this.controlPreviousEl, (this.index === 0));
      this.#setDisabled(this.controlNextEl, (this.index === this.maxIndex));
    }

    this.#updateZoom();
  }

  //

  /**
   * Loads media sources for an item when active
   * @private
   * @param {Object} item - Item data object
   * @param {number} index - Item index
   * @returns {void}
   */
  #loadItem(item, index) {
    if (index !== this.index) {
      return;
    }

    let media = select('[data-src]', item.el);

    iterate(media, (m) => {
      let onLoad = () => {
        off(m, 'error', onError);

        removeClass(item.el, 'fs-lightbox-error');
        addClass(item.el, 'fs-lightbox-loaded');

        item.isLoaded = true;

        // Navigated away while loading
        if (index !== this.index) {
          this.#unloadItem(item, index);

          return;
        }

        this.#hideLoading();
        this.#updateZoom();
      };

      // Broken media: stop loading and show the item (alt text, caption) instead of a spinner
      let onError = () => {
        off(m, 'load', onLoad);

        addClass(item.el, 'fs-lightbox-loaded', 'fs-lightbox-error');

        if (index === this.index) {
          this.#hideLoading();
          this.#updateZoom();
        }
      };

      once(m, 'load', onLoad);
      once(m, 'error', onError);

      m.src = getAttr(m, 'data-src');
    });
  }

  /**
   * Unloads media sources for non-active items
   * @private
   * @param {Object} item - Item data object
   * @param {number} index - Item index
   * @returns {void}
   */
  #unloadItem(item, index) {
    if (index == this.index) {
      return;
    }

    if ((item.isVideo || item.isIframe) && item.isLoaded) {
      let media = select('[data-src]', item.el);

      iterate(media, (m) => {
        m.src = '';
      });

      removeClass(item.el, 'fs-lightbox-loaded');

      item.isLoaded = false;
    }
  }

  //

  /**
   * Hides loading indicator
   * @private
   * @returns {void}
   */
  #hideLoading() {
    removeClass(this.loadingEl, 'fs-lightbox-visible');
    setAttr(this.loadingEl, 'aria-hidden', 'true');
    setAttr(this.lightboxEl, 'aria-busy', 'false');
  }

  /**
   * Shows loading indicator
   * @private
   * @returns {void}
   */
  #showLoading() {
    addClass(this.loadingEl, 'fs-lightbox-visible');
    removeAttr(this.loadingEl, 'aria-hidden');
    setAttr(this.lightboxEl, 'aria-busy', 'true');
  }

  //

  /**
   * Checks whether an item is an image that can zoom (loaded, not broken)
   * @private
   * @param {Object} [item] - Item data object
   * @returns {boolean} True when the item can zoom
   */
  #canZoom(item) {
    return !!(this.zoom && this.isOpen && item && item.isImage && item.isLoaded && !hasClass(item.el, 'fs-lightbox-error'));
  }

  /**
   * Returns the maximum zoom for an item: `zoomMax`, or the image's full resolution if that's
   * lower, but at least 2
   * @private
   * @param {Object} item - Item data object
   * @returns {number} Maximum scale
   */
  #maxZoom(item) {
    let ratio = item.imageEl.naturalWidth / item.imageEl.offsetWidth;

    return Math.max(1, Math.min(this.zoomMax, Math.max(2, ratio || 0)));
  }

  /**
   * Zooms the active image so the content under `from` moves to `to` (viewport points; both
   * default to the center of the view)
   * @private
   * @param {number} scale - Target scale (clamped to 1 – max)
   * @param {{ x: number, y: number }} [from] - Point to zoom around
   * @param {{ x: number, y: number }} [to] - Where that point ends up (pinches move it)
   * @param {boolean} [animate=true] - Transition to the new zoom
   * @param {Object} [state] - Zoom state to start from (a pinch starts from its first frame)
   * @returns {void}
   */
  #zoomTo(scale, from, to, animate = true, state = this.#zoom) {
    let item = this.isOpen ? this.items[this.index] : null;

    if (!this.#canZoom(item)) {
      return;
    }

    let bounds = item.el.getBoundingClientRect();
    let media = item.mediaEl.getBoundingClientRect();
    let cx = media.left + media.width / 2;
    let cy = media.top + media.height / 2;

    if (!from) {
      from = {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2
      };
    }

    to = to || from;
    scale = Math.min(Math.max(scale, 1), this.#maxZoom(item));

    let ratio = scale / state.scale;

    this.#setZoom(item, scale, to.x - cx - ratio * (from.x - cx - state.x), to.y - cy - ratio * (from.y - cy - state.y), animate);
  }

  /**
   * Applies a zoom to an item, keeping a zoomed image covering the view
   * @private
   * @param {Object} item - Item data object
   * @param {number} scale - Scale
   * @param {number} x - Horizontal offset in pixels
   * @param {number} y - Vertical offset in pixels
   * @param {boolean} animate - Transition to the new zoom
   * @returns {void}
   */
  #setZoom(item, scale, x, y, animate) {
    if (scale <= 1) {
      this.#resetZoom(animate);

      return;
    }

    let img = item.imageEl;
    let bounds = item.el.getBoundingClientRect();
    let media = item.mediaEl.getBoundingClientRect();
    let cx = media.left + media.width / 2;
    let cy = media.top + media.height / 2;
    let width = img.offsetWidth * scale / 2;
    let height = img.offsetHeight * scale / 2;

    x = clampPan(x, bounds.right - cx - width, bounds.left - cx + width);
    y = clampPan(y, bounds.bottom - cy - height, bounds.top - cy + height);

    this.#zoom = {
      item,
      scale,
      x,
      y
    };

    img.style.transition = animate ? '' : 'none';
    img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;

    this.#updateZoom();
  }

  /**
   * Resets the zoomed image, if any, to its fitted size
   * @private
   * @param {boolean} [animate=true] - Transition back
   * @returns {void}
   */
  #resetZoom(animate = true) {
    let item = this.#zoom.item;

    if (item) {
      item.imageEl.style.transition = animate ? '' : 'none';
      item.imageEl.style.transform = '';
    }

    this.#zoom = {
      item: null,
      scale: 1,
      x: 0,
      y: 0
    };

    this.#updateZoom();
  }

  /**
   * Updates zoom classes and button states for the active item
   * @private
   * @returns {void}
   */
  #updateZoom() {
    if (!this.lightboxEl) {
      return;
    }

    let item = this.items[this.index];
    let zoomable = this.#canZoom(item);
    let scale = this.#zoom.scale;

    if (zoomable) {
      addClass(this.lightboxEl, 'fs-lightbox-zoomable');
    } else {
      removeClass(this.lightboxEl, 'fs-lightbox-zoomable');
    }

    if (scale > 1) {
      addClass(this.lightboxEl, 'fs-lightbox-zoomed');
    } else {
      removeClass(this.lightboxEl, 'fs-lightbox-zoomed');
    }

    this.#setDisabled(this.zoomInEl, (!zoomable || scale >= this.#maxZoom(item)));
    this.#setDisabled(this.zoomOutEl, (!zoomable || scale <= 1));
  }

  /**
   * Marks a control button as unavailable with `aria-disabled` rather than `disabled`, so it keeps
   * focus (a focused `disabled` button drops focus to the page); clicks are ignored in its handler
   * @private
   * @param {Element} [el] - Button (custom templates may leave it out)
   * @param {boolean} disabled - Unavailable
   * @returns {void}
   */
  #setDisabled(el, disabled) {
    if (el) {
      setAttr(el, 'aria-disabled', disabled ? 'true' : false);
    }
  }

  /**
   * Checks whether an event comes from a control button marked unavailable
   * @private
   * @param {Event} e - Event
   * @returns {boolean} True when the event's button is aria-disabled
   */
  #isDisabled(e) {
    let el = e && e.currentTarget;

    return !!(el && el.nodeType === 1 && getAttr(el, 'aria-disabled') === 'true');
  }

  /**
   * Pans the zoomed image
   * @private
   * @param {number} dx - Horizontal distance in pixels
   * @param {number} dy - Vertical distance in pixels
   * @param {boolean} animate - Transition to the new position
   * @returns {void}
   */
  #panBy(dx, dy, animate) {
    let zoom = this.#zoom;

    if (zoom.item) {
      this.#setZoom(zoom.item, zoom.scale, zoom.x + dx, zoom.y + dy, animate);
    }
  }

  //

  /**
   * Normalizes index to valid bounds
   * @private
   * @returns {void}
   */
  #checkIndex() {
    if (!Number.isInteger(this.index)) {
      this.index = 0;
    }
    if (this.index < 0) {
      this.index = this.loop ? this.maxIndex : 0;
    }
    if (this.index >= this.items.length) {
      this.index = this.loop ? 0 : this.maxIndex;
    }
  }

  /**
   * Checks whether source is an image
   * @private
   * @param {string} source - Source URL
   * @returns {boolean} True when source is an image
   */
  #checkImage(source) {
    return (source.match(this.fileTypes) !== null || source.substr(0, 10) === 'data:image');
  }

  /**
   * Checks whether source matches a supported video provider
   * @private
   * @param {string} source - Source URL
   * @returns {string|boolean} Formatted provider URL or false
   */
  #checkVideo(source) {
    for (let provider of Object.values(this.videoProviders)) {
      let parts = source.match(provider.pattern);

      if (parts !== null) {
        return provider.format.call(this, parts);
      }
    }

    return false;
  }

  /**
   * Renders ordinal and caption details for an item
   * @private
   * @param {Object} item - Item data object
   * @param {Element} el - Item container element
   * @returns {void}
   */
  #checkDetails(item, el) {
    let hasOrdinal = (this.items.length > 1 && this.ordinal);

    if (!hasOrdinal && !item.caption) {
      return;
    }

    let detailsEl = element('div');

    addClass(detailsEl, 'fs-lightbox-details');

    if (hasOrdinal) {
      let ordinal = this.templates.ordinal
        .replace('[current]', item.index + 1)
        .replace('[total]', this.items.length);

      // Ordinal template is developer-defined markup
      append(detailsEl, `<div class="fs-lightbox-ordinal">${ordinal}</div>`);
    }

    if (item.caption) {
      let captionEl = element('div');

      addClass(captionEl, 'fs-lightbox-caption');

      // Caption comes from user-controlled attributes; never parse as HTML
      captionEl.textContent = item.caption;

      detailsEl.append(captionEl);
    }

    el.append(detailsEl);
  }

  /**
   * Updates status text for the active item
   * @private
   * @returns {void}
   */
  #updateStatus() {
    if (this.statusEl) {
      this.statusEl.textContent = `${this.label}: ${this.index + 1} of ${this.items.length}`;
    }
  }

  //

  /**
   * Returns the element targeted by a hash, without building a selector
   * @private
   * @param {string} hash - Hash including '#'
   * @returns {Element|null} Target element
   */
  #getTarget(hash) {
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (e) {
      return null;
    }
  }

  /**
   * Handles Space key on lightbox trigger element
   * @private
   * @param {KeyboardEvent} e - Keydown event
   * @returns {void}
   */
  #onTriggerKeyDown(e) {
    if (e.key === ' ') {
      e.preventDefault();

      this.Lightbox.open();
    }
  }

  /**
   * Handles click on lightbox trigger element
   * @private
   * @param {MouseEvent} e - Click event
   * @returns {void}
   */
  #onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    this.Lightbox.open();
  }

  /**
   * Returns container click handler for outside-click close behavior
   * @private
   * @returns {(e: MouseEvent) => void} Event handler function
   */
  #onContainerClick() {
    return (e) => {
      let item = this.items[this.index].mediaEl;

      if (e.target !== item && !item.contains(e.target)) {
        this.close();
      } else {
        this.#checkClick(e);
      }
    };
  }

  /**
   * Checks click targets for lightbox action triggers
   * @private
   * @param {MouseEvent} e - Click event
   * @returns {void}
   */
  #checkClick(e) {
    if (hasClass(e.target, 'fs-lightbox-trigger-previous')) {
      this.previous();
    }
    if (hasClass(e.target, 'fs-lightbox-trigger-next')) {
      this.next();
    }
    if (hasClass(e.target, 'fs-lightbox-trigger-close')) {
      this.close();
    }
  }

  /**
   * Returns close handler for lightbox close events
   * @private
   * @returns {(e: Event) => void} Event handler function
   */
  #onClose() {
    return (e) => {
      this.close();
    };
  }

  /**
   * Returns previous handler for lightbox navigation events
   * @private
   * @returns {(e: Event) => void} Event handler function
   */
  #onPrevious() {
    return (e) => {
      // Buttons at the ends of a gallery; commands dispatched on the window always run
      if (this.#isDisabled(e)) {
        return;
      }

      this.previous();
    };
  }

  /**
   * Returns next handler for lightbox navigation events
   * @private
   * @returns {(e: Event) => void} Event handler function
   */
  #onNext() {
    return (e) => {
      // Buttons at the ends of a gallery; commands dispatched on the window always run
      if (this.#isDisabled(e)) {
        return;
      }

      this.next();
    };
  }

  /**
   * Returns keydown handler for keyboard navigation
   * @private
   * @returns {(e: KeyboardEvent) => void} Event handler function
   */
  #onKeyDown() {
    return (e) => {
      // Leave keys to form fields, editable content and shortcuts (Ctrl/Cmd + and - zoom the page)
      if (e.altKey || e.ctrlKey || e.metaKey || (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]'))) {
        return;
      }

      if (this.#canZoom(this.items[this.index])) {
        let pan = {
          ArrowLeft: [1, 0],
          ArrowRight: [-1, 0],
          ArrowUp: [0, 1],
          ArrowDown: [0, -1]
        } [e.key];

        if (e.key === '+' || e.key === '=') {
          this.zoomIn();

          return;
        }
        if (e.key === '-') {
          this.zoomOut();

          return;
        }
        if (e.key === '0') {
          this.zoomReset();

          return;
        }

        // Arrow keys pan a zoomed image instead of changing items
        if (pan && this.#zoom.scale > 1) {
          let bounds = this.items[this.index].el.getBoundingClientRect();

          e.preventDefault();

          this.#panBy(pan[0] * bounds.width / 10, pan[1] * bounds.height / 10, true);

          return;
        }
      }

      if (e.shiftKey) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        if (this.isRTL) {
          this.next();
        } else {
          this.previous();
        }
      }
      if (e.key === 'ArrowRight') {
        if (this.isRTL) {
          this.previous();
        } else {
          this.next();
        }
      }
    };
  }

  //

  /**
   * Returns pointerdown handler for swipes, pans and pinches
   * @private
   * @returns {(e: PointerEvent) => void} Event handler function
   */
  #onPointerDown() {
    return (e) => {
      let item = this.items[this.index];

      // A new gesture clears any click blocker left by a drag that produced no click
      off(this.containerEl, 'click', this.listeners.clickblock, true);

      if (this.#pointers.has(e.pointerId) || this.#pointers.size >= 2) {
        return;
      }

      if (this.#pointers.size) {
        // A second finger pinches; it may land outside the image
        if (!this.#canZoom(item)) {
          return;
        }
      } else {
        if (
          e.button > 0 ||
          !item.mediaEl.contains(e.target) ||
          hasClass(e.target, 'fs-lightbox-trigger-previous') ||
          hasClass(e.target, 'fs-lightbox-trigger-next') ||
          hasClass(e.target, 'fs-lightbox-trigger-close') ||
          e.target.closest('a, button, input, select, textarea, label, [contenteditable]') // don't act on interactive elements
        ) {
          return;
        }

        // Galleries swipe; images zoom
        if (this.items.length < 2 && !this.#canZoom(item)) {
          return;
        }

        on(this.containerEl, 'pointermove', this.listeners.pointermove);
        on(this.containerEl, 'pointerup', this.listeners.pointerup);
        on(this.containerEl, 'pointercancel', this.listeners.pointerup);
      }

      this.#pointers.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY
      });

      this.isTouching = true;

      this.#startGesture();
    }
  }

  /**
   * Records where the current gesture starts, whenever a pointer is added or removed
   * @private
   * @returns {void}
   */
  #startGesture() {
    let points = [...this.#pointers.values()];
    let zoom = this.#zoom;

    this.#start = {
      x: points[0].x,
      y: points[0].y,
      state: {
        scale: zoom.scale,
        x: zoom.x,
        y: zoom.y
      }
    };

    if (points.length > 1) {
      // Pinch from the midpoint; a pinch replaces a swipe in progress
      this.#start.x = (points[0].x + points[1].x) / 2;
      this.#start.y = (points[0].y + points[1].y) / 2;
      this.#start.distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) || 1;

      if (this.#gesture === 'swipe') {
        this.items[this.index].el.style.transform = null;
      }

      this.#gesture = 'pinch';
      this.isDragging = true;

      addClass(this.containerEl, 'fs-lightbox-touching');
    } else if (this.#gesture === 'pinch') {
      // One finger left: keep panning a zoomed image, but don't start swiping
      this.#gesture = (zoom.scale > 1) ? 'pan' : 'pinched';
    }
  }

  /**
   * Returns pointermove handler for swipes, pans and pinches
   * @private
   * @returns {(e: PointerEvent) => void} Event handler function
   */
  #onPointerMove() {
    return (e) => {
      if (!this.#pointers.has(e.pointerId)) {
        return;
      }

      this.#pointers.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY
      });

      let item = this.items[this.index];
      let start = this.#start;

      if (this.#gesture === 'pinch') {
        let points = [...this.#pointers.values()];
        let to = {
          x: (points[0].x + points[1].x) / 2,
          y: (points[0].y + points[1].y) / 2
        };
        let distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);

        this.#zoomTo(start.state.scale * distance / start.distance, start, to, false, start.state);

        return;
      }

      let dx = e.clientX - start.x;
      let dy = e.clientY - start.y;

      // Only capture once the pointer has moved, so taps still click their target
      if (!this.#gesture) {
        if (this.#zoom.scale > 1 && Math.hypot(dx, dy) >= 10) {
          this.#gesture = 'pan';
        } else if (this.#zoom.scale === 1 && this.items.length > 1 && Math.abs(dx) >= 10) {
          this.#gesture = 'swipe';
        } else {
          return;
        }

        this.isDragging = true;

        this.containerEl.setPointerCapture(e.pointerId);

        addClass(this.containerEl, 'fs-lightbox-touching');
      }

      if (this.#gesture === 'pan') {
        this.#setZoom(item, start.state.scale, start.state.x + dx, start.state.y + dy, false);
      }

      if (this.#gesture === 'swipe') {
        item.el.style.transform = `translate3d(${dx}px, 0, 0)`;
      }
    }
  }

  /**
   * Returns pointerup handler for completing swipes, pans, pinches and double-taps
   * @private
   * @returns {(e: PointerEvent) => void} Event handler function
   */
  #onPointerUp() {
    return (e) => {
      if (!this.#pointers.has(e.pointerId)) {
        return;
      }

      let item = this.items[this.index];
      let start = this.#start;
      let gesture = this.#gesture;

      this.#pointers.delete(e.pointerId);

      if (this.#pointers.size) {
        this.#startGesture();

        return;
      }

      off(this.containerEl, 'pointermove', this.listeners.pointermove);
      off(this.containerEl, 'pointerup', this.listeners.pointerup);
      off(this.containerEl, 'pointercancel', this.listeners.pointerup);

      this.isTouching = false;
      this.isDragging = false;
      this.#gesture = null;

      removeClass(this.containerEl, 'fs-lightbox-touching');

      if (!gesture) {
        if (e.type === 'pointerup' && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 10) {
          this.#checkDoubleTap(e);
        }

        return;
      }

      if (gesture === 'swipe') {
        let diff = start.x - e.clientX;

        item.el.style.transform = null;

        if (e.type === 'pointerup' && Math.abs(diff) > this.threshold) {
          if (diff < 0) {
            if (this.isRTL) {
              this.next();
            } else {
              this.previous();
            }
          }
          if (diff > 0) {
            if (this.isRTL) {
              this.previous();
            } else {
              this.next();
            }
          }
        }
      } else if (this.#zoom.scale < 1.05) {
        // A pinch that ends near the fitted size snaps back to it
        this.#resetZoom();
      }

      // The drag captured the pointer, so its click targets the container (which closes); block it
      if (e.type === 'pointerup') {
        on(this.containerEl, 'click', this.listeners.clickblock, true);
      }
    }
  }

  /**
   * Toggles zoom at the tap point when a tap follows another one closely
   * @private
   * @param {PointerEvent} e - Pointerup event
   * @returns {void}
   */
  #checkDoubleTap(e) {
    let last = this.#lastTap;
    let tap = {
      x: e.clientX,
      y: e.clientY,
      time: e.timeStamp
    };

    this.#lastTap = tap;

    if (!last || tap.time - last.time > 300 || Math.hypot(tap.x - last.x, tap.y - last.y) > 30) {
      return;
    }

    this.#lastTap = null;

    if (this.#zoom.scale > 1) {
      this.#resetZoom();
    } else {
      this.#zoomTo(2, tap);
    }
  }

  /**
   * Returns click handler that swallows the click ending a drag
   * @private
   * @returns {(e: MouseEvent) => void} Event handler function
   */
  #onClickBlock() {
    return (e) => {
      e.stopPropagation();

      off(this.containerEl, 'click', this.listeners.clickblock, true);
    }
  }

  //

  /**
   * Returns wheel handler: Ctrl + wheel (and trackpad pinch) zooms, wheel pans a zoomed image
   * @private
   * @returns {(e: WheelEvent) => void} Event handler function
   */
  #onWheel() {
    return (e) => {
      if (!this.#canZoom(this.items[this.index])) {
        return;
      }

      // Line-based deltas (Firefox mouse wheels) are roughly 16px each
      let unit = (e.deltaMode === 1) ? 16 : 1;

      if (e.ctrlKey) {
        let point = {
          x: e.clientX,
          y: e.clientY
        };
        let delta = Math.min(Math.max(e.deltaY * unit, -50), 50);

        e.preventDefault();

        this.#zoomTo(this.#zoom.scale * Math.pow(ZOOM_STEP, -delta / 50), point, point, false);
      } else if (this.#zoom.scale > 1) {
        e.preventDefault();

        this.#panBy(-e.deltaX * unit, -e.deltaY * unit, false);
      }
    }
  }

  /**
   * Returns zoom in button handler
   * @private
   * @returns {(e: MouseEvent) => void} Event handler function
   */
  #onZoomIn() {
    return (e) => {
      if (this.#isDisabled(e)) {
        return;
      }

      this.zoomIn();
    };
  }

  /**
   * Returns zoom out button handler
   * @private
   * @returns {(e: MouseEvent) => void} Event handler function
   */
  #onZoomOut() {
    return (e) => {
      if (this.#isDisabled(e)) {
        return;
      }

      this.zoomOut();
    };
  }

  /**
   * Returns resize handler; the fitted size changes, so zoom resets
   * @private
   * @returns {(e: Event) => void} Event handler function
   */
  #onResize() {
    return (e) => {
      this.#resetZoom(false);
    };
  }

};

// Export

export default Lightbox;