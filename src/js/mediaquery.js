/**
 * @fileoverview MediaQuery - Responsive media query events
 */

import {
  isFn,
  //
  on,
  off,
} from './utils.js';

/**
 * MediaQuery class for managing responsive media query events
 * @class
 */
class MediaQuery {

  /**
   * @typedef {Object} MediaQueryBinding
   * @property {MediaQueryList} mq - Media query list
   * @property {Function} handler - Change listener bound to the media query list
   * @property {Map<string, Function>} enter - Enter callbacks by key
   * @property {Map<string, Function>} leave - Leave callbacks by key
   */

  /**
   * Bindings keyed by the browser-normalized media query text
   * @type {Map<string, MediaQueryBinding>}
   * @private
   */
  static #_bindings = new Map();

  /**
   * Binds callbacks to a media query
   * @param {string} key - Unique identifier for this binding
   * @param {string} media - Media query string (e.g., '(min-width: 768px)')
   * @param {Object} data - Object containing enter and/or leave callback functions
   * @example
   * MediaQuery.bind('mobile', '(max-width: 740px)', {
   *   enter: () => { console.log('Mobile view'); },
   *   leave: () => { console.log('Desktop view'); }
   * });
   */
  static bind(key, media, data) {
    let mq = window.matchMedia(media);
    let binding = this.#_bindings.get(mq.media);

    if (!binding) {
      binding = {
        mq: mq,
        handler: (e) => {
          this.#onBindingChange(binding, e);
        },
        enter: new Map(),
        leave: new Map()
      };

      on(mq, 'change', binding.handler);

      this.#_bindings.set(mq.media, binding);
    }

    if (binding.enter.has(key) || binding.leave.has(key)) {
      console.warn(`MediaQuery: '${key}' ${media} already exists and can not be bound`);

      return;
    }

    if (isFn(data.enter)) {
      binding.enter.set(key, data.enter);
    }

    if (isFn(data.leave)) {
      binding.leave.set(key, data.leave);
    }

    // Check Match

    let cb = binding[mq.matches ? 'enter' : 'leave'].get(key);

    if (cb) {
      cb.apply(mq);
    }

    this.#cleanUp(binding);
  }

  /**
   * Unbinds callbacks from a media query
   * @param {string} key - Unique identifier for the binding to remove
   * @param {string} [media] - Optional media query string to unbind from specific query
   * @example
   * MediaQuery.unbind('mobile');
   * MediaQuery.unbind('mobile', '(max-width: 740px)');
   */
  static unbind(key, media) {
    if (!key) {
      return;
    }

    let bindings = media ? [this.#_bindings.get(window.matchMedia(media).media)] : [...this.#_bindings.values()];

    for (let binding of bindings) {
      if (binding) {
        binding.enter.delete(key);
        binding.leave.delete(key);

        this.#cleanUp(binding);
      }
    }
  }

  /**
   * Removes a binding and its change listener once it has no callbacks
   * @private
   * @param {MediaQueryBinding} binding - Binding to check
   * @returns {void}
   */
  static #cleanUp(binding) {
    if (!binding.enter.size && !binding.leave.size) {
      off(binding.mq, 'change', binding.handler);

      this.#_bindings.delete(binding.mq.media);
    }
  }

  /**
   * Handles media query match state changes
   * @private
   * @param {MediaQueryBinding} binding - Binding that changed
   * @param {MediaQueryListEvent} e - Media query change event
   * @returns {void}
   */
  static #onBindingChange(binding, e) {
    let callbacks = binding[e.matches ? 'enter' : 'leave'];

    // Copy first; callbacks may unbind themselves or others
    for (let [key, cb] of [...callbacks]) {
      if (callbacks.get(key) === cb) {
        cb.apply(binding.mq);
      }
    }
  }

};

// Export

export default MediaQuery;
