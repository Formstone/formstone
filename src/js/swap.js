/**
 * @fileoverview Swap - Simple element classname swapping
 */

import MediaQuery from './mediaquery.js';
import {
  extend,
  //
  select,
  iterate,
  //
  on,
  off,
  trigger,
  //
  addClass,
  hasClass,
  removeClass,
  //
  hasAttr,
} from './utils.js';

// TODO look into events

/**
 * Swap class for responsive state toggling across linked and grouped elements
 * @class
 */
class Swap {

  /**
   * @type {number}
   * @private
   */
  static #_guid = 1;

  /**
   * @typedef {Object} SwapOptions
   * @property {Object} [classes] - CSS classes for enabled, active, and inactive states
   * @property {string} [classes.enabled='fs-swap-enabled'] - Enabled state class
   * @property {string} [classes.active='fs-swap-active'] - Active state class
   * @property {string} [classes.inactive='fs-swap-inactive'] - Inactive state class
   * @property {boolean} [collapse=true] - Allow active item to deactivate on click
   * @property {string|number} [maxWidth=Infinity] - Maximum viewport width to enable swap
   * @property {string} [minWidth='0px'] - Minimum viewport width to enable swap
   */

  /**
   * @type {SwapOptions}
   * @private
   */
  static #_defaults = {
    classes: {
      enabled: 'fs-swap-enabled',
      active: 'fs-swap-active',
      inactive: 'fs-swap-inactive',
    },
    collapse: true,
    maxWidth: Infinity,
    minWidth: '0px',
  };

  /**
   * Sets default options for future Swap instances
   * @param {SwapOptions} options - Object containing default options
   * @example
   * Swap.defaults({
   *   collapse: false,
   *   maxWidth: '980px'
   * });
   */
  static defaults(options) {
    this.#_defaults = extend(true, this.#_defaults, options);
  }

  /**
   * Initializes Swap plugin on target elements
   * @param {string} selector - Selector string to target
   * @param {SwapOptions} [options={}] - Object containing instance options
   * @returns {NodeList} NodeList of target elements
   * @example
   * Swap.construct('.js-swap');
   * Swap.construct('.js-swap', { collapse: false });
   */
  static construct(selector, options) {
    let targets = select(selector);

    iterate(targets, (el) => {
      if (!el.Swap) {
        new Swap(el, options);
      }
    });

    return targets;
  }

  //

  /**
   * Creates a new Swap instance
   * @constructor
   * @param {Element} el - The target element
   * @param {SwapOptions} [options={}] - Configuration options
   */
  constructor(el, options) {
    if (el.Swap) {
      console.warn('Swap: Instance already exists', el);
      return;
    }

    // Parse JSON Options

    let optionsData = {};
    let dataset = el.dataset;

    try {
      optionsData = JSON.parse(dataset.swapOptions || '{}');
    } catch (e) {
      console.warn('Swap: Error parsing options JSON', el);
    }

    // Internal Data

    Object.assign(this, extend(true, this.constructor.#_defaults, options || {}, optionsData));

    this.el = el;
    this.guid = this.constructor.#_guid++;
    this.guidClass = `fs-swap-element-${this.guid}`;
    this.guidTarget = `fs-swap-target-${this.guid}`;

    this.enabled = false;
    // this.active = el.dataset.swapActive || false;
    this.group = dataset.swapGroup ? `[data-swap-group="${dataset.swapGroup}"]` : false;
    this.linked = dataset.swapLinked ? `[data-swap-linked="${dataset.swapLinked}"]` : false;
    this.target = dataset.swapTarget || null;
    this.targetEl = select(this.target);
    // this = extend(true, this.constructor.#_defaults, options || {}, optionsData);

    let maxWidth = (this.maxWidth === Infinity ? '100000px' : this.maxWidth);

    this.mq = `(min-width: ${this.minWidth}) and (max-width: ${maxWidth})`;

    addClass(this.el, this.guidClass);
    addClass(this.targetEl, this.guidTarget);

    this.toggleEl = select(`.${this.guidClass}, .${this.guidTarget}`);

    MediaQuery.bind(this.guidClass, this.mq, {
      enter: () => {
        this.enable();
      },
      leave: () => {
        this.disable();
      }
    });

    el.Swap = this;
  }

  /**
   * Removes plugin and all related data
   * @example
   * el.Swap.destroy();
   */
  destroy() {
    this.disable();

    MediaQuery.unbind(this.guidClass);

    removeClass(this.toggleEl, this.guidClass, this.guidTarget);

    this.el.Swap = null;

    delete this.el.Swap;
  }

  //

  /**
   * Enables swap instance
   * @param {boolean} [internal=false] - Internal call flag to prevent linked recursion
   * @returns {void}
   * @example
   * el.Swap.enable();
   */
  enable(internal) {
    if (this.enabled) {
      return;
    }

    this.enabled = true;

    addClass(this.toggleEl, this.classes.enabled, this.classes.inactive);

    on(this.el, 'click', this.#onClick);

    if (!this.collapse && this.group) {
      let groupItems = select(this.group);
      let activeItems = Array.from(groupItems).filter((el) => {
        return hasAttr(el, 'data-swap-active');
      });

      if (!activeItems.length) {
        groupItems[0].dataset.swapActive = 'true';
      }
    }

    trigger(this.toggleEl, 'swap:enable');

    if (this.el.dataset.swapActive) {
      this.activate();
    }

    if (!internal && this.linked) {
      iterate(select(this.linked), (el) => {
        if (el.Swap && !hasClass(el, this.guidClass)) {
          el.Swap.enable(true);
        }
      });
    }
  }

  /**
   * Disables swap instance
   * @param {boolean} [internal=false] - Internal call flag to prevent linked recursion
   * @returns {void}
   * @example
   * el.Swap.disable();
   */
  disable(internal) {
    if (!this.enabled) {
      return;
    }

    this.enabled = false;
    this.active = false;

    removeClass(this.toggleEl, this.classes.enabled, this.classes.active, this.classes.inactive);

    off(this.el, 'click', this.#onClick);

    trigger(this.toggleEl, 'swap:disable');

    if (!internal && this.linked) {
      iterate(select(this.linked), (el) => {
        if (el.Swap && !hasClass(el, this.guidClass)) {
          el.Swap.disable(true);
        }
      });
    }
  }

  //

  /**
   * Activates swap instance
   * @param {boolean} [internal=false] - Internal call flag to prevent linked recursion
   * @returns {void}
   * @example
   * el.Swap.activate();
   */
  activate(internal) {
    if (!this.enabled || this.active) {
      return;
    }

    this.active = true;

    removeClass(this.toggleEl, this.classes.inactive);
    addClass(this.toggleEl, this.classes.active);

    if (!internal) {
      trigger(this.toggleEl, 'swap:activate');

      if (this.linked) {
        iterate(select(this.linked), (el) => {
          if (el.Swap && !hasClass(el, this.guidClass)) {
            el.Swap.activate(true);
          }
        });
      }
    }

    if (this.group) {
      iterate(select(this.linked ? `${this.group}:not(${this.linked})` : this.group), (el) => {
        if (el.Swap && !hasClass(el, this.guidClass)) {
          el.Swap.deactivate(true);
        }
      });
    }
  }

  /**
   * Deactivates swap instance
   * @param {boolean} [internal=false] - Internal call flag to prevent linked recursion
   * @returns {void}
   * @example
   * el.Swap.deactivate();
   */
  deactivate(internal) {
    if (!this.enabled || !this.active) {
      return;
    }

    this.active = false;

    removeClass(this.toggleEl, this.classes.active);
    addClass(this.toggleEl, this.classes.inactive);

    if (!internal) {
      trigger(this.toggleEl, 'swap:deactivate');

      if (this.linked) {
        iterate(select(this.linked), (el) => {
          if (el.Swap && !hasClass(el, this.guidClass)) {
            el.Swap.deactivate(true);
          }
        });
      }
    }
  }

  //

  /**
   * Handles click events and toggles instance state
   * @private
   * @param {MouseEvent} e - Click event
   * @returns {void}
   */
  #onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    let instance = this.Swap;

    if (instance.active && instance.collapse) {
      instance.deactivate();
    } else {
      instance.activate();
    }
  }

};

// Export

export default Swap;