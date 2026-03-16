/**
 * @fileoverview Utility functions for DOM manipulation, event handling, and common operations
 */

/**
 * @type {boolean}
 * @private
 */
let _readyBound = false;
/**
 * @type {Function[]}
 * @private
 */
let _readyCallbacks = [];

/**
 * Executes a callback when the DOM is ready
 * @param {Function} cb - Callback function to execute
 * @example
 * ready(() => {
 *   console.log('DOM is ready');
 * });
 */
export function ready(cb) {
  if (document.readyState === 'loading') {
    _readyCallbacks.push(cb);

    if (!_readyBound) {
      _readyBound = true;
      document.addEventListener('DOMContentLoaded', isReady, false);
    }
  } else {
    cb.call();
  }
}

/**
 * Internal function to execute all ready callbacks
 * @private
 */
function isReady() {
  iterate(_readyCallbacks, (cb) => {
    cb.call();
  });
}

//

/**
 * Returns the JavaScript type of an item
 * @param {*} item - The item to check
 * @returns {string} The type of the item ('string', 'number', 'boolean', 'object', 'function', 'undefined', 'symbol', 'bigint')
 */
export function type(item) {
  return (typeof item);
}

/**
 * Returns the prototype string representation of an item
 * @param {*} item - The item to check
 * @returns {string} The prototype string (e.g., '[object Array]', '[object Object]')
 */
export function proto(item) {
  return Object.prototype.toString.call(item);
}

/**
 * Checks if a value is falsey (undefined, false, or null)
 * @param {*} v - The value to check
 * @returns {boolean} True if the value is undefined, false, or null
 */
export function falsey(v) {
  return (isU(v) || v === false || v === null);
}

/**
 * Checks if a value is a function
 * @param {*} v - The value to check
 * @returns {boolean} True if the value is a function
 */
export function isFn(v) {
  return (type(v) === 'function');
}

/**
 * Checks if a value is an object
 * @param {*} v - The value to check
 * @returns {boolean} True if the value is an object
 */
export function isObj(v) {
  return (type(v) === 'object');
}

/**
 * Checks if a value is undefined
 * @param {*} v - The value to check
 * @returns {boolean} True if the value is undefined
 */
export function isU(v) {
  return (type(v) === 'undefined');
}

/**
 * Extends objects by merging properties from one or more source objects
 * @param {...(boolean|Object)} args - If first argument is boolean, enables deep merge. Remaining arguments are objects to merge
 * @returns {Object} The extended object
 * @example
 * // Shallow merge
 * extend({a: 1}, {b: 2}); // {a: 1, b: 2}
 *
 * // Deep merge
 * extend(true, {a: {x: 1}}, {a: {y: 2}}); // {a: {x: 1, y: 2}}
 */
export function extend(...args) {
  let extended = {};
  let deep = false;
  let i = 0;

  if (type(args[0]) === 'boolean') {
    deep = args[0];
    i++;
  }

  let merge = (obj) => {
    for (let prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        if (deep && proto(obj[prop]) === '[object Object]') {
          extended[prop] = extend(extended[prop], obj[prop]);
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  for (; i < args.length; i++) {
    merge(args[i]);
  }

  return extended;
}

//

/**
 * Creates a new DOM element
 * @param {string} tag - The HTML tag name to create
 * @returns {Element} The created element
 * @example
 * const div = element('div');
 */
export function element(tag) {
  return document.createElement(tag);
}

/**
 * Selects all elements matching a CSS selector
 * @param {string} selector - CSS selector string
 * @param {Element|Document} [context=document] - Context element or document to search within
 * @returns {NodeList} NodeList of matching elements
 * @example
 * const buttons = select('.btn');
 * const inputs = select('input', form);
 */
export function select(selector, context) {
  return (context || document).querySelectorAll(selector);
}

/**
 * Gets all sibling elements of a node
 * @param {Element} node - The element to get siblings for
 * @returns {Element[]} Array of sibling elements
 */
export function siblings(node) {
  return [...node.parentElement.children].filter((child) => {
    return child != node;
  });
}

//

/**
 * Inserts HTML at the beginning of a node
 * @param {Element} node - The element to insert into
 * @param {String} string - The HTML content to insert
 */
export function prepend(node, string) {
  node.insertAdjacentHTML('afterbegin', string);
}

/**
 * Inserts HTML at the end of a node
 * @param {Element} node - The element to insert into
 * @param {String} string - The HTML content to insert
 */
export function append(node, string) {
  node.insertAdjacentHTML('beforeend', string);
}

/**
 * Inserts HTML before a node
 * @param {Element} node - The element to insert before
 * @param {String} string - The HTML content to insert
 */
export function before(node, string) {
  node.insertAdjacentHTML('beforebegin', string);
}

/**
 * Inserts HTML after a node
 * @param {Element} node - The element to insert after
 * @param {String} string - The HTML content to insert
 */
export function after(node, string) {
  node.insertAdjacentHTML('afterend', string);
}

//

/**
 * Converts a value to an iterable array
 * @param {*} target - The target to convert (Element, NodeList, Array, or any value)
 * @returns {Array} Array of non-falsey items
 */
export function iterable(target) {
  if (!['[object NodeList]', '[object Array]'].includes(proto(target))) {
    target = [target];
  }

  return [...target].filter((item) => {
    // return item instanceof Element;
    return !falsey(item);
  });
}

/**
 * Iterates over a target and executes a callback for each item
 * @param {Element|NodeList|Array|*} target - The target to iterate over
 * @param {Function} cb - Callback function to execute for each item
 */
export function iterate(target, cb) {
  iterable(target).forEach(cb);
}

//

/**
 * Adds event listener(s) to element(s)
 * @param {Element|NodeList|Array} target - The target element(s)
 * @param {string} event - The event name
 * @param {Function} cb - The event handler callback
 * @param {Object|boolean} [options] - Event listener options
 * @example
 * on(button, 'click', handleClick);
 * on(select('.item'), 'mouseenter', handleHover);
 */
export function on(target, event, cb, options) {
  iterate(target, (el) => {
    el.addEventListener(event, cb, options || null);
  });
}

/**
 * Adds a one-time event listener to element(s)
 * @param {Element|NodeList|Array} target - The target element(s)
 * @param {string} event - The event name
 * @param {Function} cb - The event handler callback
 * @param {Object|boolean} [options] - Event listener options
 */
export function once(target, event, cb, options) {
  on(target, event, cb, extend({
    once: true,
    capture: (options === true)
  }, (isObj(options)) ? options : {}));
}

/**
 * Removes event listener(s) from element(s)
 * @param {Element|NodeList|Array} target - The target element(s)
 * @param {string} event - The event name
 * @param {Function} cb - The event handler callback to remove
 */
export function off(target, event, cb) {
  iterate(target, (el) => {
    el.removeEventListener(event, cb);
  });
}

/**
 * Dispatches a custom event on element(s)
 * @param {Element|NodeList|Array} target - The target element(s)
 * @param {string} event - The event name
 * @param {*} [detail] - Optional detail data to pass with the event
 * @example
 * trigger(element, 'customEvent', {data: 'value'});
 */
export function trigger(target, event, detail) {
  iterate(target, (el) => {
    el.dispatchEvent(new CustomEvent(event, {
      detail: detail || null
    }));
  });
}

//

/**
 * Normalizes class names into an array
 * @param {...(string|string[])} classes - Class names as strings or array
 * @returns {string[]} Array of normalized class names
 * @private
 */
export function normalizeClasses(...classes) {
  if (proto(classes[0]) === '[object Array]') {
    classes = classes[0];
  }

  classes = classes.join(' ').split(' ');

  classes = classes.filter((c) => {
    return c !== '';
  });

  return classes;
}

/**
 * Checks if an element has a class
 * @param {Element} target - The target element
 * @param {string} c - The class name to check
 * @returns {boolean} True if the element has the class
 */
export function hasClass(target, c) {
  return target.classList.contains(c);
}

/**
 * Adds class(es) to element(s)
 * @param {Element|NodeList|Array} target - The target element(s)
 * @param {...string} classes - Class names to add
 * @example
 * addClass(element, 'active');
 * addClass(select('.item'), 'highlight', 'selected');
 */
export function addClass(target, ...classes) {
  classes = normalizeClasses(...classes);

  iterate(target, (el) => {
    el.classList.add(...classes);
  });
}

/**
 * Removes class(es) from element(s)
 * @param {Element|NodeList|Array} target - The target element(s)
 * @param {...string} classes - Class names to remove
 * @example
 * removeClass(element, 'active');
 * removeClass(select('.item'), 'highlight', 'selected');
 */
export function removeClass(target, ...classes) {
  classes = normalizeClasses(...classes);

  iterate(target, (el) => {
    el.classList.remove(...classes);
  });
}

//

/**
 * Checks if an element has an attribute
 * @param {Element} target - The target element
 * @param {string} attr - The attribute name
 * @returns {boolean} True if the element has the attribute
 */
export function hasAttr(target, attr) {
  return target.hasAttribute(attr);
}

/**
 * Gets an attribute value from an element
 * @param {Element} target - The target element
 * @param {string} attr - The attribute name
 * @returns {string|null} The attribute value or null if not present
 */
export function getAttr(target, attr) {
  return target.getAttribute(attr);
}

/**
 * Normalizes attributes into an array of entries
 * @param {string|Object} attr - Attribute name or object of attribute key-value pairs
 * @param {string} [value] - Attribute value (when attr is a string)
 * @returns {Array<[string, string]>} Array of [name, value] tuples
 * @private
 */
export function normalizeAttrs(attr, value) {
  if (proto(attr) !== '[object Object]') {
    let newAttr = {};
    newAttr[`${attr}`] = value;
    attr = newAttr;
  }

  return Object.entries(attr);
}

/**
 * Sets attribute(s) on element(s)
 * @param {Element|NodeList|Array} target - The target element(s)
 * @param {string|Object} attr - Attribute name or object of attribute key-value pairs
 * @param {string} [value] - Attribute value (when attr is a string). If falsey, removes the attribute
 * @example
 * setAttr(element, 'data-id', '123');
 * setAttr(element, {id: 'myId', 'data-type': 'primary'});
 */
export function setAttr(target, attr, value) {
  attr = normalizeAttrs(attr, value);

  iterate(target, (el) => {
    for (let [a, v] of attr) {
      if (falsey(v)) {
        removeAttr(target, a);
      } else {
        el.setAttribute(a, v);
      }
    }
  });
}

/**
 * Removes attribute(s) from element(s)
 * @param {Element|NodeList|Array} target - The target element(s)
 * @param {string|string[]} attr - Attribute name(s) to remove
 * @example
 * removeAttr(element, 'disabled');
 * removeAttr(element, ['disabled', 'hidden']);
 */
export function removeAttr(target, attr) {
  if (proto(attr) !== '[object Array]') {
    attr = [attr];
  }

  iterate(target, (el) => {
    iterate(attr, (a) => {
      el.removeAttribute(a);
    });
  });
}

//

/**
 * Updates an attribute value and stores the original in a data attribute
 * @param {Element|NodeList|Array} els - The target element(s)
 * @param {string} attr - The attribute name to update
 * @param {string} value - The new attribute value
 * @param {string} handle - A handle used to namespace the backup data attribute
 */
export function updateAttr(els, attr, value, handle) {
  let key = camelCase([handle, attr].join('-'));

  iterate(els, (el) => {
    el.dataset[key] = getAttr(el, attr) || '';
    setAttr(el, attr, value);
  });
}

/**
 * Restores an attribute to its original value from a data attribute
 * @param {Element|NodeList|Array} els - The target element(s)
 * @param {string} attr - The attribute name to restore
 * @param {string} handle - The handle used when the attribute was updated
 */
export function restoreAttr(els, attr, handle) {
  let key = camelCase([handle, attr].join('-'));

  iterate(els, (el) => {
    setAttr(el, attr, el.dataset[key] || false);
    delete el.dataset[key];
  });
}

//

/**
 * Converts a hyphenated or space-separated string to camelCase
 * @param {string} string - The string to convert
 * @returns {string} The camelCased string
 * @example
 * camelCase('my-data-attr'); // 'myDataAttr'
 * camelCase('background color'); // 'backgroundColor'
 */
export function camelCase(string) {
  return string.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, char) => {
    return char.toUpperCase();
  });
}