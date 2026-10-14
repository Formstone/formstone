/**
 * @fileoverview Navigation - Responsive navigation menus
 * Accessibility based on https://plousia.com/blog/how-create-accessible-mobile-menu
 */

import Swap from './swap.js';
import {
  isU,
  extend,
  //
  select,
  siblings,
  iterate,
  //
  on,
  off,
  trigger,
  //
  addClass,
  removeClass,
  //
  getAttr,
  setAttr,
  removeAttr,
  updateAttr,
  restoreAttr,
} from './utils.js';

/**
 * Navigation class for responsive menus with toggle, push, reveal, and overlay modes
 * @class
 */
class Navigation {

  /**
   * @type {number}
   * @private
   */
  static #_guid = 1;

  /**
   * @typedef {Object} NavigationOptions
   * @property {string} [gravity='left'] - Navigation gravity (left, right)
   * @property {string} [label='Menu'] - Accessibility label
   * @property {string} [maxWidth='980px'] - Width to auto-disable plugin
   * @property {string} [type='toggle'] - Navigation type (toggle, push, reveal, overlay)
   * @property {string} [focusables] - Selector for focusable elements
   */

  /**
   * @type {NavigationOptions}
   * @private
   */
  static #_defaults = {
    gravity: 'left',
    label: 'Menu',
    maxWidth: '980px',
    type: 'toggle',
    focusables: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  };

  //

  /**
   * Sets default options for future Navigation instances
   * @param {NavigationOptions} options - Object containing default options
   * @example
   * Navigation.defaults({
   *   type: 'push'
   * });
   */
  static defaults(options) {
    this.#_defaults = extend(true, this.#_defaults, options);
  }

  /**
   * Initializes Navigation plugin on target elements
   * @param {string} selector - Selector string to target
   * @param {NavigationOptions} [options={}] - Object containing instance options
   * @returns {NodeList} NodeList of target elements
   * @example
   * Navigation.construct('.js-navigation');
   * Navigation.construct('.js-navigation', { type: 'overlay' });
   */
  static construct(selector, options) {
    let targets = select(selector);

    iterate(targets, (el) => {
      if (!el.Navigation) {
        new Navigation(el, options);
      }
    });

    return targets;
  }

  //

  /**
   * Creates a new Navigation instance
   * @constructor
   * @param {Element} el - The target element
   * @param {NavigationOptions} [options={}] - Configuration options
   */
  constructor(el, options) {
    if (el.Navigation) {
      console.warn('Navigation: Instance already exists', el);
      return;
    }

    // Parse JSON Options

    let optionsData = {};
    let dataset = el.dataset;

    try {
      optionsData = JSON.parse(dataset.navigationOptions || '{}');
    } catch (e) {
      console.warn('Navigation: Error parsing options JSON', el);
    }

    // Internal Data

    Object.assign(this, extend(true, this.constructor.#_defaults, options || {}, optionsData));

    this.el = el;
    this.guid = this.constructor.#_guid++;
    this.guidClass = `fs-navigation-element-${this.guid}`;
    this.guidHandle = `fs-navigation-handle-${this.guid}`;
    this.isOpen = false;

    this.handleEl = dataset.navigationHandle ? select(dataset.navigationHandle) : [];
    this.contentEl = dataset.navigationContent ? select(dataset.navigationContent) : [];

    if (!this.handleEl.length) {
      console.warn('Navigation: Handle not found; set data-navigation-handle', el);

      return;
    }

    this.isToggle = (this.type === 'toggle');

    if (!this.contentEl.length && (this.type === 'push' || this.type === 'reveal')) {
      console.warn(`Navigation: Content not found; ${this.type} navigation needs data-navigation-content`, el);
    }

    let typeClass = `fs-navigation-${this.type}`;
    let gravityClass = (!this.isToggle) ? `${typeClass}-${this.gravity}` : '';

    this.navClasses = ['fs-navigation', this.guidClass, `${typeClass}-nav`, (gravityClass ? `${gravityClass}-nav` : '')];
    this.handleClasses = ['fs-navigation-handle', this.guidHandle, `${typeClass}-handle`, (gravityClass ? `${gravityClass}-handle` : '')];
    this.contentClasses = ['fs-navigation-content', `${typeClass}-content`];
    this.contentOpenClasses = ['fs-navigation-open', (gravityClass ? `${gravityClass}-content` : '')];

    //

    addClass(el, this.navClasses);
    addClass(this.handleEl, this.handleClasses);
    addClass(this.contentEl, this.contentClasses);

    //

    this.originalRole = getAttr(this.el, 'role');
    this.originalHidden = getAttr(this.el, 'aria-hidden');
    this.originalLabel = getAttr(this.el, 'aria-label');
    this.originalModal = getAttr(this.el, 'aria-modal');

    //

    this.originalId = getAttr(this.el, 'id');

    if (this.originalId) {
      this.elId = this.originalId;
    } else {
      this.elId = this.guidClass;
      setAttr(this.el, 'id', this.elId);
    }

    this.listeners = {
      open: this.#onOpen(this),
      close: this.#onClose(this),
      enable: this.#onEnable(this),
      disable: this.#onDisable(this),
      body: this.#onBodyClick(this),
      keydown: this.#onKeyDown(this)
    };

    setAttr(this.handleEl, {
      'data-swap-target': `.${this.guidClass}`,
      'data-swap-linked': `${this.guidHandle}`,
      'data-swap-group': 'fs-navigation'
    });

    iterate(this.handleEl, (handle) => {
      // Store the attribute (not the tabIndex property, which is -1 for non-focusable elements)
      setAttr(handle, 'data-navigation-tabindex', getAttr(handle, 'tabindex') || '');
      handle.tabIndex = 0;

      on(handle, 'swap:activate', this.listeners.open);
      on(handle, 'swap:deactivate', this.listeners.close);
      on(handle, 'swap:enable', this.listeners.enable);
      on(handle, 'swap:disable', this.listeners.disable);
    });

    Swap.construct(`.${this.guidHandle}`, {
      classes: {
        enabled: 'fs-navigation-enabled',
        active: 'fs-navigation-open',
        inactive: 'fs-navigation-closed',
      },
      collapse: true,
      maxWidth: this.maxWidth
    });

    el.Navigation = this;
  }

  //

  /**
   * Removes plugin and all related data
   * @example
   * el.Navigation.destroy();
   */
  destroy() {
    this.listeners.disable.call();

    removeClass(this.el, this.navClasses);
    removeClass(this.handleEl, this.handleClasses);
    removeClass(this.contentEl, this.contentClasses);
    removeAttr(this.el, 'aria-hidden');

    removeAttr(this.handleEl, [
      'data-swap-target',
      'data-swap-linked',
      'data-swap-group'
    ]);

    iterate(this.handleEl, (handle) => {
      setAttr(handle, 'tabindex', getAttr(handle, 'data-navigation-tabindex') || false);
      removeAttr(handle, 'data-navigation-tabindex');

      off(handle, 'swap:activate', this.listeners.open);
      off(handle, 'swap:deactivate', this.listeners.close);
      off(handle, 'swap:enable', this.listeners.enable);
      off(handle, 'swap:disable', this.listeners.disable);

      handle.Swap.destroy();
    });

    this.el.Navigation = null;

    delete this.el.Navigation;
  }

  //

  /**
   * Enables navigation instance
   * @example
   * el.Navigation.enable();
   */
  enable() {
    iterate(this.handleEl, (handle) => {
      handle.Swap.enable();
    });
  }

  /**
   * Disables navigation instance
   * @example
   * el.Navigation.disable();
   */
  disable() {
    iterate(this.handleEl, (handle) => {
      handle.Swap.disable();
    });
  }

  //

  /**
   * Opens navigation instance
   * @example
   * el.Navigation.open();
   */
  open() {
    this.handleEl[0].Swap.activate();
  }

  /**
   * Closes navigation instance
   * @example
   * el.Navigation.close();
   */
  close() {
    this.handleEl[0].Swap.deactivate();
  }

  //

  /**
   * Returns enable handler for swap events
   * @private
   * @returns {(e: Event) => void} Event handler function
   */
  #onEnable() {
    return (e) => {
      setAttr(this.el, 'aria-label', this.label);

      if (!this.isToggle) {
        setAttr(this.el, {
          'role': 'dialog',
          'aria-modal': 'true'
        });
      }

      setAttr(this.handleEl, {
        'aria-controls': this.elId,
        'aria-expanded': 'false',
        'aria-haspopup': this.isToggle ? false : 'dialog'
      });

      this.#hideFocusables();

      addClass(this.contentEl, 'fs-navigation-enabled');

      setTimeout(() => {
        addClass(this.el, 'fs-navigation-animated');
        addClass(this.contentEl, 'fs-navigation-animated');
      }, 0);
    };
  }

  /**
   * Returns disable handler for swap events
   * @private
   * @returns {(e: Event) => void} Event handler function
   */
  #onDisable() {
    return (e) => {
      this.listeners.close.call();

      setAttr(this.el, {
        'role': this.originalRole || false,
        'aria-hidden': this.originalHidden || false,
        'aria-label': this.originalLabel || false,
        'aria-modal': this.originalModal || false,
        'id': this.originalId || false
      });

      this.#showFocusables();

      removeAttr(this.handleEl, [
        'aria-controls',
        'aria-expanded',
        'aria-haspopup'
      ]);

      removeClass(this.el, 'fs-navigation-animated');
      removeClass(this.contentEl, 'fs-navigation-enabled', 'fs-navigation-animated', this.contentOpenClasses);
    };
  }

  /**
   * Returns open handler for swap events
   * @private
   * @returns {(e: Event) => void} Event handler function
   */
  #onOpen() {
    return (e) => {
      setAttr(this.el, 'aria-hidden', 'false');

      this.#showFocusables();

      addClass(this.contentEl, this.contentOpenClasses);

      if (!this.isToggle) {
        this.#hideSiblings();
      }

      setAttr(this.handleEl, 'aria-expanded', 'true');

      // On document, not body: clicks on inert content target <html>
      on(document, 'keydown', this.listeners.keydown);

      // Deferred so a click that called open() doesn't reach the listener and close it again
      setTimeout(() => {
        if (this.isOpen) {
          on(document, 'click', this.listeners.body);
        }
      }, 0);

      if (!this.isOpen) {
        trigger(this.el, 'navigation:open');

        this.isOpen = true;

        setTimeout(() => {
          (select(this.focusables, this.el)[0] || this.el).focus();
        }, 50);
      }
    };
  }

  /**
   * Returns close handler for swap events
   * @private
   * @returns {(e: Event) => void} Event handler function
   */
  #onClose() {
    return (e) => {
      setAttr(this.el, 'aria-hidden', 'true');

      this.#hideFocusables();

      removeClass(this.contentEl, this.contentOpenClasses);

      if (!this.isToggle) {
        this.#showSiblings();
      }

      setAttr(this.handleEl, 'aria-expanded', 'false');

      off(document, 'click', this.listeners.body);
      off(document, 'keydown', this.listeners.keydown);

      if (this.isOpen) {
        trigger(this.el, 'navigation:close');

        // Return focus only if it was in the navigation; an outside click keeps its own focus
        let focused = document.activeElement;

        if (!focused || focused === document.body || this.el.contains(focused)) {
          this.handleEl[0].focus();
        }

        this.isOpen = false;
      }
    };
  }

  //

  /**
   * Gets elements outside the navigation: siblings of the element and of each ancestor up to
   * the body, excluding other Navigation instances
   * @private
   * @returns {Element[]} Array of elements
   */
  #getSiblings() {
    let outside = [];

    for (let node = this.el; node.parentElement && node !== document.body; node = node.parentElement) {
      outside.push(...siblings(node).filter((el) => {
        return isU(el.Navigation) && !['SCRIPT', 'STYLE', 'TEMPLATE'].includes(el.tagName);
      }));
    }

    return outside;
  }

  /**
   * Makes the rest of the page inert while the modal navigation is open
   * Inert content is hidden from assistive technologies and can't be focused or clicked,
   * which keeps focus inside the navigation
   * @private
   * @returns {void}
   */
  #hideSiblings() {
    // Only track elements this instance changes, so restoring leaves others' state alone
    this.inertEls = this.#getSiblings().filter((el) => {
      return !el.inert;
    });

    iterate(this.inertEls, (el) => {
      el.inert = true;
    });
  }

  /**
   * Restores the rest of the page
   * @private
   * @returns {void}
   */
  #showSiblings() {
    iterate(this.inertEls, (el) => {
      el.inert = false;
    });

    this.inertEls = [];
  }

  //

  /**
   * Gets focusable elements within the navigation element
   * @private
   * @returns {NodeList} NodeList of focusable elements
   */
  #getFocusables() {
    return select(this.focusables, this.el);
  }

  /**
   * Disables focus on focusable child elements
   * @private
   * @returns {void}
   */
  #hideFocusables() {
    updateAttr(this.#getFocusables(), 'tabindex', '-1', 'navigation');
  }

  /**
   * Restores focus on focusable child elements
   * @private
   * @returns {void}
   */
  #showFocusables() {
    restoreAttr(this.#getFocusables(), 'tabindex', 'navigation');
  }

  //

  /**
   * Returns body click handler for outside-click close behavior
   * @private
   * @returns {(e: MouseEvent) => void} Event handler function
   */
  #onBodyClick() {
    return (e) => {
      if (e.target !== this.el && !this.el.contains(e.target)) {
        this.close();
      }
    };
  }

  /**
   * Returns keydown handler for Escape key close behavior
   * @private
   * @returns {(e: KeyboardEvent) => void} Event handler function
   */
  #onKeyDown() {
    return (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    }
  }

};

// Export

export default Navigation;