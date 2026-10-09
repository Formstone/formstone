/**
 * @fileoverview Modal - Simple modal dialog component
 * Accessibility based on https://plousia.com/blog/how-create-accessible-mobile-menu
 * Updated with work by @nhall
 */

// import MediaQuery from './mediaquery.js';
import {
  extend,
  //
  element,
  select,
  iterate,
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
} from './utils.js';

let ModalInstance;

/**
 * @typedef {Object} ModalOptions
 * @property {string} [customClass=''] - Custom CSS class for modal dialog
 * @property {boolean} [returnFocus=true] - Return focus to trigger after closing
 * @property {Object} [templates] - HTML templates for modal components
 */

/**
 * Modal class for displaying inline page content
 * @class
 */
class Modal {

  static #_guid = 1;

  static #_defaults = {
    customClass: '',
    returnFocus: true,
    templates: {
      container: `
<dialog class="fs-modal" role="dialog" aria-modal="true">
  <div class="fs-modal-container">
    <div class="fs-modal-wrap">
      <button type="button" class="fs-modal-close" autofocus>[close]</button>
      <div class="fs-modal-frame"></div>
    </div>
  </div>
</dialog>`,
      close: `<span class="fs-modal-sr">Close</span><svg viewBox="-6 -6 24 24" fill="currentColor"><path d="M7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485 2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535 3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z"></path></svg>`,
    },
  };

  /**
   * Sets default options for future Modal instances
   * @param {ModalOptions} options - Object containing default options
   * @example
   * Modal.defaults({
   *   customClass: 'my-modal'
   * });
   */
  static defaults(options) {
    this.#_defaults = extend(true, this.#_defaults, options);
  }

  /**
   * Initializes Modal plugin on target elements
   * @param {string} selector - Selector string to target
   * @param {ModalOptions} [options={}] - Object containing instance options
   * @returns {NodeList} NodeList of target elements
   * @example
   * Modal.construct('.js-modal');
   * Modal.construct('.js-modal', { customClass: 'custom-modal' });
   */
  static construct(selector, options) {
    let targets = select(selector);

    iterate(targets, (el) => {
      if (!el.Modal) {
        new Modal(el, options);
      }
    });

    return targets;
  }

  //

  /**
   * Creates a new Modal instance
   * @constructor
   * @param {Element} el - The target element
   * @param {ModalOptions} [options={}] - Configuration options
   */
  constructor(el, options) {
    if (el.Modal) {
      console.warn('Modal: Instance already exists', el);
      return;
    }

    // Parse JSON Options

    let optionsData = {};
    let dataset = el.dataset;

    try {
      optionsData = JSON.parse(dataset.modalOptions || '{}');
    } catch (e) {
      console.warn('Modal: Error parsing options JSON', el);
    }

    // Internal Data

    Object.assign(this, extend(true, this.constructor.#_defaults, options || {}, optionsData));

    this.el = el;
    this.guid = this.constructor.#_guid++;
    this.guidClass = `fs-modal-element-${this.guid}`;
    this.isOpen = false;

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
      setAttr(this.el, 'aria-label', 'Open Modal');
    }

    on(this.el, 'click', this.#onClick);
    on(this.el, 'keydown', this.#onTriggerKeyDown);

    el.Modal = this;
  }

  //

  /**
   * Removes plugin and all related data
   * @example
   * el.Modal.destroy();
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

    this.el.Modal = null;

    delete this.el.Modal;
  }

  //

  /**
   * Opens modal instance
   * @example
   * el.Modal.open();
   */
  open() {
    let promise = ModalInstance ? ModalInstance.close() : Promise.resolve();

    promise.then(() => {
      if (this.isOpen) {
        return;
      }

      this.hash = this.el.hash;
      this.targetEl = this.#getTarget(this.hash);

      if (!this.targetEl) {
        console.warn(`Modal: Target ${this.hash} not found`, this.el);

        return;
      }

      this.listeners = {
        'close': this.#onClose(),
        'container': this.#onContainerClick(),
      };

      this.#draw();

      if (typeof this.modalEl.showModal === 'function') {
        this.modalEl.showModal();
      }

      setTimeout(() => {
        addClass(this.modalEl, 'fs-modal-open');

        this.isOpen = true;

        ModalInstance = this;

        trigger(window, 'modal:open', {
          el: this.el
        });
      }, 10);
    });
  }

  /**
   * Closes active modal instance
   * @returns {Promise} Promise that resolves when close transition completes
   * @example
   * el.Modal.close();
   */
  close() {
    if (!this.isOpen) {
      return;
    }

    // Fixes 'stuck' instance
    if (!hasClass(this.modalEl, 'fs-modal-open')) {
      this.#cleanUp();

      return Promise.resolve();
    }

    removeClass(this.modalEl, 'fs-modal-open');

    off(window, 'modal:close', this.listeners.close);

    return new Promise((resolve) => {
      afterTransition(this.modalEl, () => {
        this.#cleanUp();

        resolve(this.el);
      });
    });
  }

  /**
   * Cleans up modal state and restores moved content
   * @private
   * @returns {void}
   */
  #cleanUp() {
    this.targetEl.append(...this.frameEl.childNodes);

    this.modalEl.remove();

    this.isOpen = false;

    if (this.returnFocus) {
      this.el.focus();
    }

    trigger(window, 'modal:close', {
      el: this.el
    });

    ModalInstance = null;
  }

  //

  /**
   * Renders modal UI and binds event listeners
   * @private
   * @returns {void}
   */
  #draw() {
    let html = this.templates.container
      .replace('[close]', this.templates.close);

    let template = element('template');

    template.innerHTML = html.trim();

    // Keep a reference to this dialog rather than querying the page for one
    this.modalEl = template.content.firstElementChild;

    document.body.append(this.modalEl);

    this.overlayEl = select('.fs-modal-overlay', this.modalEl)[0];
    this.closeEl = select('.fs-modal-close', this.modalEl)[0];
    this.containerEl = select('.fs-modal-container', this.modalEl)[0];
    this.wrapEl = select('.fs-modal-wrap', this.modalEl)[0];
    this.frameEl = select('.fs-modal-frame', this.modalEl)[0];

    this.frameEl.append(...this.targetEl.childNodes);
    this.wrapEl.append(this.frameEl);

    addClass(this.modalEl, this.customClass);

    once(this.closeEl, 'click', this.listeners.close);
    on(this.containerEl, 'click', this.listeners.container);
    on(this.modalEl, 'cancel', (e) => {
      this.close();
    });
    on(window, 'modal:close', this.listeners.close);
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
   * Handles Space key on modal trigger element
   * @private
   * @param {KeyboardEvent} e - Keydown event
   * @returns {void}
   */
  #onTriggerKeyDown(e) {
    if (e.key === ' ') {
      e.preventDefault();

      this.Modal.open();
    }
  }

  /**
   * Handles click on modal trigger element
   * @private
   * @param {MouseEvent} e - Click event
   * @returns {void}
   */
  #onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    this.Modal.open();
  }

  /**
   * Returns container click handler for outside-click close behavior
   * @private
   * @returns {(e: MouseEvent) => void} Event handler function
   */
  #onContainerClick() {
    return (e) => {
      if (e.target !== this.wrapEl && !this.wrapEl.contains(e.target)) {
        this.close();
      } else {
        this.#checkClick(e);
      }
    };
  }

  /**
   * Checks click targets for modal action triggers
   * @private
   * @param {MouseEvent} e - Click event
   * @returns {void}
   */
  #checkClick(e) {
    if (hasClass(e.target, 'fs-modal-trigger-close')) {
      this.close();
    }
  }

  /**
   * Returns close handler for modal close events
   * @private
   * @returns {(e: Event) => void} Event handler function
   */
  #onClose() {
    return (e) => {
      this.close();
    };
  }

  // #onKeyDown() {
  //   return (e) => {
  //     if (e.key === 'Escape') {
  //       this.close();
  //     }
  //   };
  // }

};

// Export

export default Modal;