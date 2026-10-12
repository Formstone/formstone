/**
 * @fileoverview Cookie - Simple cookie management utility
 */

import {
  type,
  isU,
  extend,
} from './utils.js';

/**
 * Cookie class for managing browser cookies
 * @class
 */
class Cookie {

  /**
   * @typedef {Object} CookieOptions
   * @property {string} [domain=null] - Cookie domain
   * @property {number} [expires=604800000] - Expiration time in milliseconds (default 7 days)
   * @property {string} [path='/'] - Cookie path; site-wide by default
   * @property {string} [samesite='Lax'] - SameSite attribute ('Strict', 'Lax', or 'None')
   * @property {boolean} [secure=null] - Secure attribute
   */

  /**
   * @type {CookieOptions}
   * @private
   */
  static #_defaults = {
    domain: null,
    expires: 604800000, // 7 days
    path: '/',
    samesite: 'Lax',
    secure: null
  };

  /**
   * Sets default options for all future cookie operations
   * @param {CookieOptions} options - Object containing default options
   * @example
   * Cookie.defaults({
   *   expires: 3600000, // 1 hour
   *   secure: true
   * });
   */
  static defaults(options) {
    this.#_defaults = extend(true, this.#_defaults, options);
  }

  //

  /**
   * Sets a cookie value
   * @param {string} key - Cookie key/name
   * @param {string} value - Cookie value
   * @param {CookieOptions} [options={}] - Object containing cookie options
   * @example
   * // Set a basic cookie
   * Cookie.set('username', 'john');
   *
   * // Set a cookie with custom expiration
   * Cookie.set('token', 'abc123', {
   *   expires: 3600000, // 1 hour
   *   secure: true,
   *   samesite: 'Strict'
   * });
   */
  static set(key, value, options) {
    let expiration = false;
    let date = new Date();

    options = extend(true, this.#_defaults, options || {});

    // Check Expiration Date

    if (type(options.expires) === 'number') {
      date.setTime(date.getTime() + options.expires);
      expiration = date.toUTCString();
    }

    // Browsers reject SameSite=None cookies that aren't Secure
    let isNone = String(options.samesite).toLowerCase() === 'none';

    let domain = (options.domain) ? '; domain=' + options.domain : '';
    let expires = (expiration) ? '; expires=' + expiration : '';
    let maxAge = (expiration) ? '; max-age=' + Math.round(options.expires / 1000) : ''; // to whole seconds
    let path = (options.path) ? '; path=' + options.path : '';
    let samesite = (options.samesite) ? '; samesite=' + options.samesite : '';
    let secure = (options.secure || isNone) ? '; secure' : '';

    // Set Cookie

    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}${expires}${maxAge}${domain}${path}${samesite}${secure}`;
  }

  /**
   * Gets a cookie value by key
   * @param {string} key - Cookie key/name
   * @returns {string|null} Cookie value or null if not found
   * @example
   * let username = Cookie.get('username');
   * if (username) {
   *   console.log('Welcome back, ' + username);
   * }
   */
  static get(key) {
    let keyString = `${encodeURIComponent(key)}=`;
    let cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();

      if (cookie.indexOf(keyString) === 0) {
        let value = cookie.substring(keyString.length, cookie.length);

        // Cookies set elsewhere may contain malformed escape sequences
        try {
          return decodeURIComponent(value);
        } catch (e) {
          return value;
        }
      }
    }

    return null;
  }

  /**
   * Deletes a cookie by setting its expiration to the past
   * @param {string} key - Cookie key/name
   * @param {CookieOptions} [options={}] - Object containing cookie options (domain and path should match the original cookie)
   * @example
   * Cookie.delete('username');
   *
   * // Delete cookie with specific domain/path
   * Cookie.delete('token', {
   *   domain: '.example.com',
   *   path: '/'
   * });
   */
  static delete(key, options) {
    options = extend({}, options, {
      expires: -604800000 // -7 days
    });

    this.set(key, '', options);

    // Without an explicit path, also remove a copy scoped to the current directory
    // (the browser default, used by cookies set before path defaulted to '/')
    if (isU(options.path)) {
      this.set(key, '', extend({}, options, {
        path: false
      }));
    }
  }
};

// Export

export default Cookie;