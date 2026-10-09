import {
  isFn,
  isObj,
  isU
} from '../js/utils.js';

/**
 * @type {Array<Function>}
 * @private
 */
let registrations = [];

/**
 * Applies a registration to the global jQuery (if present) and remembers it for install()
 * @private
 * @param {Function} fn - Function that adds a plugin to a jQuery instance
 * @returns {void}
 */
function register(fn) {
  registrations.push(fn);

  if (typeof jQuery !== 'undefined') {
    fn(jQuery);
  }
}

/**
 * Registers every imported plugin on a jQuery instance
 * Use when jQuery isn't a global, e.g. when it's imported in a bundler
 * @param {Function} $ - jQuery
 * @returns {Function} The same jQuery instance
 * @example
 * import $ from 'jquery';
 * import { install } from 'formstone/jquery';
 *
 * install($);
 */
export function install($) {
  registrations.forEach((fn) => {
    fn($);
  });

  return $;
}

/**
 * Registers a widget plugin as `$.fn.name(options | 'method', ...args)`
 * Method calls return the first element's result when it isn't undefined (e.g. a Promise),
 * otherwise the jQuery collection for chaining
 * @param {Function} Plugin - Plugin class
 * @param {string} Namespace - Plugin name
 * @returns {void}
 */
export function widget(Plugin, Namespace) {
  register(($) => {
    $.fn[Namespace.toLowerCase()] = function(options, ...args) {
      if (!options || isObj(options)) {
        return this.each((index, el) => {
          new Plugin(el, options);
        });
      }

      let result;

      this.each((index, el) => {
        if (el[Namespace] && isFn(el[Namespace][options])) {
          let value = el[Namespace][options](...args);

          if (isU(result)) {
            result = value;
          }
        }
      });

      return isU(result) ? this : result;
    };
  });
}

/**
 * Registers a utility plugin as `$.name('method', ...args)`
 * @param {Function} Plugin - Plugin class
 * @param {string} Namespace - Plugin name
 * @returns {void}
 */
export function utility(Plugin, Namespace) {
  register(($) => {
    $[Namespace.toLowerCase()] = function(method, ...args) {
      if (isFn(Plugin[method])) {
        return Plugin[method](...args);
      }
    };
  });
}