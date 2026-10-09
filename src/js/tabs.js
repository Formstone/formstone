/**
 * @fileoverview Tabs - Simple, mobile-friendly tabs
 * Accessibility work by @nhall
 */

import MediaQuery from './mediaquery.js';
import Swap from './swap.js';
import {
  extend,
  //
  element,
  select,
  iterate,
  //
  on,
  off,
  trigger,
  //
  addClass,
  removeClass,
  hasClass,
  //
  getAttr,
  setAttr,
  removeAttr,
} from './utils.js';

/**
 * Tabs class for responsive tab interfaces
 * @class
 */
class Tabs {

  /**
   * @type {number}
   * @private
   */
  static #_guid = 1;

  /**
   * @typedef {Object} TabsOptions
   * @property {string|number} [maxWidth=Infinity] - Maximum viewport width to enable tabs
   * @property {string|number} [mobileMaxWidth='740px'] - Maximum viewport width for mobile tab mode
   * @property {boolean} [automatic=true] - Automatically activate focused tabs with keyboard navigation
   * @property {string} [label='Tabs'] - Accessibility label for the tab list
   */

  /**
   * @type {TabsOptions}
   * @private
   */
  static #_defaults = {
    maxWidth: Infinity,
    mobileMaxWidth: '740px',
    automatic: true,
    label: 'Tabs'
  };

  //

  /**
   * Sets default options for future Tabs instances
   * @param {TabsOptions} options - Object containing default options
   * @example
   * Tabs.defaults({
   *   automatic: false,
   *   mobileMaxWidth: '960px'
   * });
   */
  static defaults(options) {
    this.#_defaults = extend(true, this.#_defaults, options);
  }

  /**
   * Initializes Tabs plugin on target elements
   * @param {string} selector - Selector string to target
   * @param {TabsOptions} [options={}] - Object containing instance options
   * @returns {NodeList} NodeList of target elements
   * @example
   * Tabs.construct('.js-tabs');
   * Tabs.construct('.js-tabs', { automatic: false });
   */
  static construct(selector, options) {
    let targets = select(selector);

    targets.forEach((el) => {
      if (!el.Tabs) {
        new Tabs(el, options);
      }
    });

    return targets;
  }

  //

  /**
   * Creates a new Tabs instance
   * @constructor
   * @param {Element} el - The target tab element
   * @param {TabsOptions} [options={}] - Configuration options
   */
  constructor(el, options) {
    if (el.Tabs) {
      console.warn('Tabs: Instance already exists', el);
      return;
    }

    // Parse JSON Options

    let optionsData = {};
    let dataset = el.dataset;

    try {
      optionsData = JSON.parse(dataset.tabsOptions || '{}');
    } catch (e) {
      console.warn('Tabs: Error parsing options JSON', el);
    }

    // Internal Data

    Object.assign(this, extend(true, this.constructor.#_defaults, options || {}, optionsData));

    this.el = el;
    this.guid = this.constructor.#_guid++;
    this.guidClass = `fs-tabs-element-${this.guid}`;
    this.guidContent = `fs-tabs-content-${this.guid}`;

    let mobileMaxWidth = ((this.mobileMaxWidth === Infinity || this.mobileMaxWidth === 'Infinity') ? '100000px' : this.mobileMaxWidth);

    this.mq = `(max-width: ${mobileMaxWidth})`;

    this.target = el.hash;
    this.container = dataset.tabsContainer;
    this.group = dataset.tabsGroup;

    this.mobileEl = element('button');
    this.contentEl = select(this.target)[0];
    this.containerEl = select(this.container)[0];

    this.handleEl = [el, this.mobileEl];

    //

    this.mobileEl.innerHTML = el.innerHTML;

    setAttr(this.mobileEl, {
      'type': 'button',
      'aria-hidden': 'true',
      'tabindex': '-1',
    });

    addClass(el, 'fs-tabs-tab', this.guidClass);
    addClass(this.mobileEl, 'fs-tabs-tab_mobile', this.guidClass);
    addClass(this.contentEl, 'fs-tabs-content', this.guidContent);
    addClass(this.containerEl, 'fs-tabs-container');

    this.contentEl.parentNode.insertBefore(this.mobileEl, this.contentEl);

    // Aria

    // SHOULD BE IN ENABLE / DISABLE?
    this.originalId = getAttr(el, 'id');

    if (this.originalId) {
      this.elId = this.originalId;
    } else {
      this.elId = this.guidClass;
      setAttr(el, 'id', this.elId);
    }

    this.originalContentId = getAttr(this.contentEl, 'id');

    if (this.originalContentId) {
      this.contentId = this.originalContentId;
    } else {
      this.contentId = this.guidContent;
      setAttr(this.contentEl, 'id', this.contentId);
    }

    // Check for hash

    let hash = window.location.hash;

    this.hashActive = false;
    this.hashGroup = false;

    if (hash.length) {
      this.hashActive = (el.hash == hash);
      this.hashGroup = this.group && (select(`[data-tabs-group="${this.group}"][href$="${hash}]`).length > 0);
    }

    // SHOULD BE IN ENABLE / DISABLE?
    if (this.hashActive) {
      setAttr(this.handleEl, 'data-swap-active', 'true');
    } else if (this.hashGroup) {
      removeAttr(this.handleEl, 'data-swap-active');
    } else if (this.el.dataset.tabsActive === 'true') {
      setAttr(this.handleEl, 'data-swap-active', 'true');
    }

    //

    this.listeners = {
      activate: this.#onActivate(this),
      deactivate: this.#onDeactivate(this),
      enable: this.#onEnable(this),
      disable: this.#onDisable(this),
      keydown: this.#onKeyDown(this)
    };

    this.handleEl.forEach((handle) => {
      setAttr(handle, {
        'data-swap-target': `.${this.guidContent}`,
        'data-swap-linked': `${this.guidClass}`,
        'data-swap-group': `${this.group}`
      });

      on(handle, 'swap:activate', this.listeners.activate);
      on(handle, 'swap:deactivate', this.listeners.deactivate);
      on(handle, 'swap:enable', this.listeners.enable);
      on(handle, 'swap:disable', this.listeners.disable);
    });

    on(this.el, 'keydown', this.listeners.keydown);

    MediaQuery.bind(this.guidClass, this.mq, {
      enter: () => {
        this.#mobileEnable();
      },
      leave: () => {
        this.#mobileDisable();
      }
    });

    Swap.construct(`.${this.guidClass}`, {
      classes: {
        enabled: 'fs-tabs-enabled',
        active: 'fs-tabs-active',
        inactive: 'fs-tabs-inactive',
      },
      collapse: false,
      maxWidth: this.maxWidth
    });

    el.Tabs = this;
  }

  //

  /**
   * Removes plugin and all related data
   * @example
   * el.Tabs.destroy();
   */
  destroy() {
    this.listeners.disable.call();

    MediaQuery.unbind(this.guidClass);

    this.#mobileDisable();

    removeClass(this.el, 'fs-tabs-tab', this.guidClass);
    removeClass(this.contentEl, 'fs-tabs-content', this.guidContent);
    removeClass(this.containerEl, 'fs-tabs-container');

    off(this.el, 'keydown', this.listeners.keydown);

    this.handleEl.forEach((handle) => {
      removeAttr(handle, [
        'data-swap-target',
        'data-swap-linked',
        'data-swap-group'
      ]);

      off(handle, 'swap:activate', this.listeners.activate);
      off(handle, 'swap:deactivate', this.listeners.deactivate);
      off(handle, 'swap:enable', this.listeners.enable);
      off(handle, 'swap:disable', this.listeners.disable);

      if (handle.Swap) {
        handle.Swap.destroy();
      }
    });

    this.mobileEl.remove();

    this.el.Tabs = null;

    delete this.el.Tabs;
  }

  //

  /**
   * Enables tabs instance
   * @example
   * el.Tabs.enable();
   */
  enable() {
    this.el.Swap.enable();
  }

  /**
   * Disables tabs instance
   * @example
   * el.Tabs.disable();
   */
  disable() {
    this.el.Swap.disable();
  }

  //

  /**
   * Activates tabs instance
   * @example
   * el.Tabs.activate();
   */
  activate() {
    this.el.Swap.activate();
  }

  /**
   * Deactivates tabs instance
   * @example
   * el.Tabs.deactivate();
   */
  deactivate() {
    this.el.Swap.deactivate();
  }

  //

  /**
   * Returns enable handler for swap events
   * @private
   * @returns {(e: Event) => void} Event handler function
   */
  #onEnable() {
    return (e) => {
      setAttr(this.el, {
        'role': 'tab',
        'aria-controls': this.contentId
      });

      setAttr(this.contentEl, {
        'role': 'tabpanel',
        'aria-labelledby': this.elId
      });

      setAttr(this.containerEl, {
        'role': 'tablist',
        'aria-label': this.label
      });

      let isActive = getAttr(this.el, 'data-swap-active') === 'true';

      setAttr(this.el, {
        'aria-selected': isActive ? 'true' : 'false',
        'tabindex': isActive ? '0' : '-1'
      });

      if (select('a, button, input, [tabindex="0"]', this.contentEl).length === 0) {
        setAttr(this.contentEl, 'tabindex', '0');
      }

      trigger(this.el, 'tabs:enable');

      // setAttr(this.el, 'aria-label', this.label);

      // if (!this.isToggle) {
      //   setAttr(this.el, {
      //     'role': 'dialog',
      //     'aria-modal': 'true'
      //   });
      // }

      // setAttr(this.handle, 'aria-controls', this.elId);

      // if (this.isToggle) {
      //   setAttr(this.handle, 'aria-expanded', 'false');
      // }

      // addClass(this.content, 'fs-navigation-enabled');

      // setTimeout(() => {
      //   addClass(this.el, 'fs-navigation-animated');
      //   addClass(this.content, 'fs-navigation-animated');
      // }, 0);
    };
  }

  /**
   * Returns disable handler for swap events
   * @private
   * @returns {(e: Event) => void} Event handler function
   */
  #onDisable() {
    return (e) => {
      removeAttr(this.el, ['role', 'aria-controls', 'aria-selected', 'tabindex']);

      removeAttr(this.contentEl, ['role', 'aria-labelledby', 'tabindex']);

      removeAttr(this.containerEl, ['role', 'aria-label']);

      trigger(this.el, 'tabs:disable');

      // SHOULD BE IN ENABLE / DISABLE
      // setAttr(this.el, {
      //   'role': this.originalRole || false,
      //   'aria-label': this.originaLabel || false,
      //   'aria-modal': this.originaModal || false,
      //   'id': this.originalId || false
      // });
    };
  }

  /**
   * Returns activate handler for swap events
   * @private
   * @returns {(e: Event) => void} Event handler function
   */
  #onActivate() {
    return (e) => {
      if (this.group) {
        iterate(select(`[data-tabs-group="${this.group}"]`), (el) => {
          if (el.Tabs && el !== this.el) {
            setAttr(el, {
              'aria-selected': 'false',
              'tabindex': '-1'
            });
            setAttr(el.Tabs.mobileEl, {
              'aria-expanded': 'false'
            });
          }
        });
      }

      setAttr(this.el, {
        'aria-selected': 'true',
        'tabindex': '0'
      });
      setAttr(this.mobileEl, {
        'aria-expanded': 'true'
      });

      trigger(this.el, 'tabs:activate');

      // window.location.hash = this.el.hash;
    };
  }

  /**
   * Returns deactivate handler for swap events
   * @private
   * @returns {(e: Event) => void} Event handler function
   */
  #onDeactivate() {
    return (e) => {
      setAttr(this.el, {
        'aria-selected': 'false',
        'tabindex': '-1'
      });
      setAttr(this.mobileEl, {
        'aria-expanded': 'false'
      });

      trigger(this.el, 'tabs:deactivate');
    };
  }

  /**
   * Returns keydown handler for tab keyboard navigation
   * @private
   * @returns {(e: KeyboardEvent) => void} Event handler function
   */
  #onKeyDown() {
    return (e) => {
      let tabs = Array.from(select(`[role="tab"]`, this.containerEl));
      let index = tabs.indexOf(e.currentTarget);
      let next;

      if (e.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];

      if (e.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];

      if (e.key === 'Home') next = tabs[0];

      if (e.key === 'End') next = tabs[tabs.length - 1];

      if (next) {
        e.preventDefault();
        next.focus();

        if (this.automatic && !hasClass(this.el, 'fs-tabs-mobile')) {
          next.click();
        }
      }
    };
  }

  //

  /**
   * Enables mobile tab behavior
   * @private
   * @returns {void}
   */
  #mobileEnable() {
    iterate(this.handleEl, (handle) => {
      addClass(handle, 'fs-tabs-mobile');
    });

    setAttr(this.el, {
      'aria-hidden': 'true',
      'tabindex': '-1',
    });

    let isActive = getAttr(this.el, 'data-swap-active') === 'true';

    setAttr(this.mobileEl, {
      'aria-hidden': 'false',
      'aria-controls': this.contentId,
      'aria-expanded': isActive ? 'true' : 'false',
      'tabindex': '0'
    });
  }

  /**
   * Disables mobile tab behavior
   * @private
   * @returns {void}
   */
  #mobileDisable() {
    iterate(this.handleEl, (handle) => {
      removeClass(handle, 'fs-tabs-mobile');
    });

    setAttr(this.mobileEl, {
      'aria-hidden': 'true',
      'tabindex': '-1'
    });

    removeAttr(this.mobileEl, ['aria-controls', 'aria-expanded']);

    removeAttr(this.el, [
      'aria-hidden',
      'tabindex'
    ]);
  }

};

// Export

export default Tabs;