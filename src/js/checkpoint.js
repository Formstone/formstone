/**
 * @fileoverview Checkpoint - Animate elements on scroll
 */

import {
  extend,
  //
  select,
  iterate,
  //
  trigger,
  //
  addClass,
  removeClass,
} from './utils.js';

/**
 * CheckPoint class for animating elements on scroll
 * @class
 */
class CheckPoint {

  /**
   * @type {number}
   * @private
   */
  static #_guid = 1;

  /**
   * @typedef {Object} CheckPointOptions
   * @property {string} [offset='0px'] - Element offset for activating animation (pixels or percentage)
   * @property {boolean} [reverse=false] - Deactivate animation when scrolling back
   */

  /**
   * @type {CheckPointOptions}
   * @private
   */
  static #_defaults = {
    // intersect: 'bottom',
    offset: '0px',
    reverse: false
  };

  /**
   * Sets default options for future CheckPoint instances
   * @param {CheckPointOptions} options - Object containing default options
   * @example
   * CheckPoint.defaults({
   *   reverse: true
   * });
   */
  static defaults(options) {
    this.#_defaults = extend(true, this.#_defaults, options);
  }

  /**
   * Initializes CheckPoint plugin on target elements
   * @param {string} selector - Selector string to target
   * @param {CheckPointOptions} [options={}] - Object containing instance options
   * @returns {NodeList} NodeList of target elements
   * @example
   * CheckPoint.construct('.js-checkpoint');
   * CheckPoint.construct('.js-checkpoint', { reverse: true });
   */
  static construct(selector, options) {
    let targets = select(selector);

    iterate(targets, (el) => {
      if (!el.CheckPoint) {
        new CheckPoint(el, options);
      }
    });

    return targets;
  }

  //

  /**
   * Creates a new CheckPoint instance
   * @constructor
   * @param {Element} el - The target element
   * @param {CheckPointOptions} [options={}] - Configuration options
   */
  constructor(el, options) {
    if (el.CheckPoint) {
      console.warn('Checkpoint: Instance already exists', el);
      return;
    }

    // Parse JSON Options

    let optionsData = {};
    let dataset = el.dataset;

    try {
      optionsData = JSON.parse(dataset.checkpointOptions || '{}');
    } catch (e) {
      console.warn('Checkpoint: Error parsing options JSON', el);
    }

    // Internal Data

    Object.assign(this, extend(true, this.constructor.#_defaults, options || {}, optionsData));

    this.el = el;
    this.guid = this.constructor.#_guid++;
    this.guidClass = `fs-checkpoint-element-${this.guid}`;

    this.enabled = false;
    this.active = false;
    this.hasActived = false;
    this.parent = dataset.checkpointParent || null;
    this.parentEl = this.parent ? select(this.parent)[0] : null;
    this.trigger = dataset.checkpointTrigger || dataset.checkpointContainer || null;

    addClass(this.el, this.guidClass);

    this.target = this.trigger || `.${this.guidClass}`;
    this.targetEl = select(this.target);

    // this.intersect = dataset.checkpointIntersect || this.intersect;
    this.offset = dataset.checkpointOffset || this.offset;

    this.margin = `0px 0px -${this.offset} 0px`;
    this.edge = parseInt(this.offset, 10);
    this.percent = this.offset.includes('%') ? (this.edge / 100) : null;

    this.observer = new IntersectionObserver((entries, observer) => {
      iterate(entries, (entry) => {
        this.#observe(entry);
      });
    }, {
      root: this.parentEl || document,
      threshold: 0,
      rootMargin: this.margin
    });

    this.enable();

    el.CheckPoint = this;
  }

  /**
   * Removes plugin and all related data
   * @example
   * el.CheckPoint.destroy();
   */
  destroy() {
    this.disable();

    removeClass(this.el, this.guidClass);

    this.observer.disconnect();
    this.observer = null;

    this.el.CheckPoint = null;

    delete this.el.CheckPoint;
  }

  //

  /**
   * Internal IntersectionObserver callback
   * @private
   * @param {IntersectionObserverEntry} entry - Intersection observer entry
   * @returns {void}
   */
  #observe(entry) {
    let height = this.parentEl ? this.parentEl.innerHeight : window.innerHeight;
    let edge = height - (this.percent ? (height * this.percent) : this.edge);

    if (entry.isIntersecting || entry.boundingClientRect.top < edge) {
      this.activate();
    } else {
      this.deactivate();
    }
  }

  //

  /**
   * Enables the CheckPoint instance
   * @example
   * el.CheckPoint.enable();
   */
  enable() {
    if (this.enabled) {
      return;
    }

    this.enabled = true;

    addClass(this.el, 'fs-checkpoint');

    iterate(this.targetEl, (el) => {
      this.observer.observe(el);
    });
  }

  /**
   * Disables the CheckPoint instance
   * @example
   * el.CheckPoint.disable();
   */
  disable() {
    if (!this.enabled) {
      return;
    }

    this.deactivate();

    // Reset state; deactivate() is a no-op for non-reverse instances that already activated
    this.active = false;
    this.hasActived = false;

    this.enabled = false;

    removeClass(this.el, 'fs-checkpoint', 'fs-checkpoint-active');

    iterate(this.targetEl, (el) => {
      this.observer.unobserve(el);
    });
  }

  //

  /**
   * Activates the checkpoint animation
   * @fires checkpoint:activate
   * @example
   * el.CheckPoint.activate();
   */
  activate() {
    if (!this.enabled || this.active) {
      return;
    }

    this.active = true;
    this.hasActived = true;

    addClass(this.el, 'fs-checkpoint-active');
    trigger(this.el, 'checkpoint:activate', {});
  }

  /**
   * Deactivates the checkpoint animation
   * @fires checkpoint:deactivate
   * @example
   * el.CheckPoint.deactivate();
   */
  deactivate() {
    if (!this.enabled || !this.active || (!this.reverse && this.hasActived)) {
      return;
    }

    this.active = false;

    removeClass(this.el, 'fs-checkpoint-active');
    trigger(this.el, 'checkpoint:deactivate', {});
  }

};

// Export

export default CheckPoint;