---
title: Utils
published: true
visible: true
---

# Utils

Core utility functions used throughout Formstone.

<div class="docs_menu" markdown="1">

* [Methods](#methods)

</div>


<hr class="divider">


<div class="docs" markdown="1">

## Methods {#methods}

Utils is a module of functions, available as the `Utils` export (`import { Utils } from 'formstone'`) or individually (`import { select, on } from 'formstone/utils'`). Most functions that take a target accept an element, a NodeList, an HTMLCollection, an array, a Set or any other iterable collection.

| Name | Description |
| -- | -- |
| [`.addClass()`](#method-addclass) | Adds class(es) to target(s) |
| [`.after()`](#method-after) | Inserts HTML after a target |
| [`.afterTransition()`](#method-aftertransition) | Executes callback once an element's transition completes |
| [`.append()`](#method-append) | Inserts HTML at the end of a target |
| [`.before()`](#method-before) | Inserts HTML before a target |
| [`.camelCase()`](#method-camelcase) | Converts a string to camelCase |
| [`.element()`](#method-element) | Creates a new element |
| [`.extend()`](#method-extend) | Deep or shallow merge of objects |
| [`.falsey()`](#method-falsey) | Checks if a value is "falsey" |
| [`.getAttr()`](#method-getattr) | Returns an attribute value from an element |
| [`.hasAttr()`](#method-hasattr) | Checks if an element has an attribute |
| [`.hasClass()`](#method-hasclass) | Checks if an element has a class |
| [`.isFn()`](#method-isfn) | Checks if a value is a function |
| [`.isObj()`](#method-isobj) | Checks if a value is an object |
| [`.isU()`](#method-isu) | Checks if a value is undefined |
| [`.iterable()`](#method-iterable) | Normalizes an item into an array for iteration |
| [`.iterate()`](#method-iterate) | Iterates over items |
| [`.normalizeAttrs()`](#method-normalizeattrs) | Normalizes attribute arguments into name/value pairs |
| [`.normalizeClasses()`](#method-normalizeclasses) | Normalizes class name arguments into an array |
| [`.off()`](#method-off) | Removes event listener(s) |
| [`.on()`](#method-on) | Adds event listener(s) |
| [`.once()`](#method-once) | Adds a one-time event listener |
| [`.prepend()`](#method-prepend) | Inserts HTML at the beginning of a target |
| [`.proto()`](#method-proto) | Returns the internal type tag of a value |
| [`.ready()`](#method-ready) | Executes callback when DOM is ready |
| [`.removeAttr()`](#method-removeattr) | Removes attribute(s) |
| [`.removeClass()`](#method-removeclass) | Removes class(es) from target(s) |
| [`.restoreAttr()`](#method-restoreattr) | Restores an attribute's value |
| [`.select()`](#method-select) | Selects elements via query selector |
| [`.setAttr()`](#method-setattr) | Sets attribute(s) |
| [`.siblings()`](#method-siblings) | Returns siblings of an element |
| [`.transitionTime()`](#method-transitiontime) | Returns an element's longest transition time |
| [`.trigger()`](#method-trigger) | Triggers a custom event |
| [`.type()`](#method-type) | Returns the native typeof of an item |
| [`.updateAttr()`](#method-updateattr) | Preserves and updates an attribute |


<hr class="divider">


## Core {#core}

### .ready() {#method-ready}

Executes a callback when the DOM is ready, or immediately if already loaded.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `cb` | `function` | Callback function to execute |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.ready(() => {
  console.log('DOM is ready');
});
```
</figure>


<hr class="divider">


## Checks {#checks}

### .type() {#method-type}

Returns the JavaScript type of an item.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `item` | `any` | The item to check |

#### Returns

| Type | Description |
| -- | -- |
| `string` | The type of the item ('string', 'number', 'boolean', 'object', 'function', 'undefined', 'symbol', 'bigint') |

### .proto() {#method-proto}

Returns the internal type tag of a value, from `Object.prototype.toString`. Useful where `typeof` isn't specific enough.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `item` | `any` | The item to check |

#### Returns

| Type | Description |
| -- | -- |
| `string` | The type tag (e.g. `'[object Array]'`, `'[object Object]'`, `'[object NodeList]'`) |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.proto([]); // '[object Array]'
Utils.proto(null); // '[object Null]'
```
</figure>

### .falsey() {#method-falsey}

Checks if a value is falsey (undefined, false, or null).

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `v` | `any` | The value to check |

#### Returns

| Type | Description |
| -- | -- |
| `boolean` | True if the value is undefined, false, or null |

### .isFn() {#method-isfn}

Checks if a value is a function.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `v` | `any` | Value to check |

#### Returns

| Type | Description |
| -- | -- |
| `boolean` | True if a function |

### .isObj() {#method-isobj}

Checks if a value is an object. Returns `false` for `null`.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `v` | `any` | Value to check |

#### Returns

| Type | Description |
| -- | -- |
| `boolean` | True if an object |

### .isU() {#method-isu}

Checks if a value is undefined.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `v` | `any` | Value to check |

#### Returns

| Type | Description |
| -- | -- |
| `boolean` | True if undefined |


<hr class="divider">


## Objects {#objects}

### .extend() {#method-extend}

Extends objects by merging properties from one or more source objects into a new object; the arguments are never modified. A deep merge recurses into plain objects at any depth. Arrays, functions, regular expressions and other non-plain values are copied by reference, not merged. `__proto__` keys are ignored.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `deep` | `boolean` (optional) | If first argument is boolean, enables deep merge |
| `...args` | `object` | Objects to merge |

#### Returns

| Type | Description |
| -- | -- |
| `object` | The extended object |

#### Examples

<figure class="example js-example" markdown="1">
```js
// Shallow merge
Utils.extend({a: 1}, {b: 2}); // {a: 1, b: 2}

// Deep merge
Utils.extend(true, {a: {x: 1}}, {a: {y: 2}}); // {a: {x: 1, y: 2}}
Utils.extend(true, {a: {b: {x: 1}}}, {a: {b: {y: 2}}}); // {a: {b: {x: 1, y: 2}}}
```
</figure>


<hr class="divider">


## Selection {#selection}

### .select() {#method-select}

Selects all elements matching a CSS selector.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `selector` | `string` | CSS selector string |
| `context` | `element|Document` (optional) | Context element or document to search within (defaults to document) |

#### Returns

| Type | Description |
| -- | -- |
| `NodeList` | NodeList of matching elements |

#### Examples

<figure class="example js-example" markdown="1">
```js
let buttons = Utils.select('.btn');
let inputs = Utils.select('input', form);
```
</figure>

### .element() {#method-element}

Creates a new DOM element.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `tag` | `string` | The HTML tag name to create |

#### Returns

| Type | Description |
| -- | -- |
| `element` | The created element |

#### Examples

<figure class="example js-example" markdown="1">
```js
let div = Utils.element('div');
```
</figure>

### .siblings() {#method-siblings}

Gets all sibling elements of a node.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `node` | `element` | The element to get siblings for |

#### Returns

| Type | Description |
| -- | -- |
| `array` | Array of sibling elements |


<hr class="divider">


## Insertion {#insertion}

### .prepend() {#method-prepend}

Inserts HTML at the beginning of a node.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `node` | `element` | The element to insert into |
| `string` | `string` | The HTML content to insert |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.prepend(container, '<span class="first">First</span>');
```
</figure>

### .append() {#method-append}

Inserts HTML at the end of a node.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `node` | `element` | The element to insert into |
| `string` | `string` | The HTML content to insert |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.append(container, '<span class="last">Last</span>');
```
</figure>

### .before() {#method-before}

Inserts HTML before a node.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `node` | `element` | The element to insert before |
| `string` | `string` | The HTML content to insert |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.before(item, '<li class="label">Start</li>');
```
</figure>

### .after() {#method-after}

Inserts HTML after a node.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `node` | `element` | The element to insert after |
| `string` | `string` | The HTML content to insert |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.after(item, '<li class="label">End</li>');
```
</figure>


<hr class="divider">


## Iteration {#iteration}

### .iterate() {#method-iterate}

Iterates over a target and executes a callback for each item. Collections (NodeList, HTMLCollection, array, Set and other iterables) are iterated; a single value, string or DOM node is treated as one item; `null`, `undefined` and `false` items are skipped.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `target` | `element|NodeList|HTMLCollection|array|Set|any` | The target to iterate over |
| `cb` | `function` | Callback function to execute for each item |

### .iterable() {#method-iterable}

Converts a value to an array for iteration. Collections (NodeList, HTMLCollection, array, Set and other iterables) are expanded; a single value, string or DOM node becomes a one-item array (`<form>` and `<select>` elements are not expanded into their controls). `null`, `undefined` and `false` items are removed.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `target` | `any` | The target to convert (element, collection, or any value) |

#### Returns

| Type | Description |
| -- | -- |
| `array` | Array of non-falsey items |


<hr class="divider">


## Events {#events}

### .on() {#method-on}

Adds event listener(s) to element(s).

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `target` | `element|NodeList|array` | The target element(s) |
| `event` | `string` | The event name |
| `cb` | `function` | The event handler callback |
| `options` | `object|boolean` (optional) | Event listener options |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.on(button, 'click', handleClick);
Utils.on(Utils.select('.item'), 'mouseenter', handleHover);
```
</figure>

### .once() {#method-once}

Adds a one-time event listener to element(s).

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `target` | `element|NodeList|array` | The target element(s) |
| `event` | `string` | The event name |
| `cb` | `function` | The event handler callback |
| `options` | `object|boolean` (optional) | Event listener options |

### .off() {#method-off}

Removes event listener(s) from element(s).

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `target` | `element|NodeList|array` | The target element(s) |
| `event` | `string` | The event name |
| `cb` | `function` | The event handler callback to remove |
| `options` | `object|boolean` (optional) | Listener options; `capture` must match the value used with `.on()` |

### .trigger() {#method-trigger}

Dispatches a custom event on element(s). `detail` is passed through as-is, including falsy values like `0`, `false` and `''`; it defaults to `null`.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `target` | `element|NodeList|array` | The target element(s) |
| `event` | `string` | The event name |
| `detail` | `any` (optional) | Optional detail data to pass with the event |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.trigger(element, 'customEvent', {data: 'value'});
```
</figure>

### .transitionTime() {#method-transitiontime}

Returns the longest transition (duration + delay) of an element in milliseconds.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `el` | `element` | The target element |

#### Returns

| Type | Description |
| -- | -- |
| `number` | Transition time in milliseconds |

### .afterTransition() {#method-aftertransition}

Executes a callback once an element's transition completes. Runs immediately when the element has no transition (for example with `prefers-reduced-motion`), and falls back to a timeout because `transitionend` never fires for `0s`, interrupted, or non-rendered transitions. Only transitions on the element itself count; bubbled child transitions are ignored.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `el` | `element` | The transitioning element |
| `cb` | `function` | Callback function, executed once |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.removeClass(dialog, 'open');
Utils.afterTransition(dialog, () => {
  dialog.remove();
});
```
</figure>


<hr class="divider">


## Classes {#classes}

### .addClass() {#method-addclass}

Adds class(es) to element(s).

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `target` | `element|NodeList|array` | The target element(s) |
| `...classes` | `string` | Class names to add |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.addClass(element, 'active');
Utils.addClass(Utils.select('.item'), 'highlight', 'selected');
```
</figure>

### .removeClass() {#method-removeclass}

Removes class(es) from element(s).

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `target` | `element|NodeList|array` | The target element(s) |
| `...classes` | `string` | Class names to remove |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.removeClass(element, 'active');
Utils.removeClass(Utils.select('.item'), 'highlight', 'selected');
```
</figure>

### .hasClass() {#method-hasclass}

Checks if an element has a class.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `target` | `element` | The target element |
| `c` | `string` | The class name to check |

#### Returns

| Type | Description |
| -- | -- |
| `boolean` | True if the element has the class |


### .normalizeClasses() {#method-normalizeclasses}

Normalizes class name arguments into an array of single class names. Used by the class helpers, so `addClass()`, `removeClass()` and `hasClass()` accept the same forms.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `...classes` | `string|array` | Class names: separate arguments, space-separated strings, or a single array |

#### Returns

| Type | Description |
| -- | -- |
| `array` | Class names, with empty entries removed |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.normalizeClasses('a b', 'c'); // ['a', 'b', 'c']
Utils.normalizeClasses(['a', 'b c', '']); // ['a', 'b', 'c']
```
</figure>


<hr class="divider">


## Attributes {#attributes}

### .setAttr() {#method-setattr}

Sets attribute(s) on element(s).

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `target` | `element|NodeList|array` | The target element(s) |
| `attr` | `string|object` | Attribute name or object of attribute key-value pairs |
| `value` | `string` (optional) | Attribute value (when attr is a string). If falsey, removes the attribute |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.setAttr(element, 'data-id', '123');
Utils.setAttr(element, {id: 'myId', 'data-type': 'primary'});
```
</figure>

### .getAttr() {#method-getattr}

Gets an attribute value from an element.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `target` | `element` | The target element |
| `attr` | `string` | The attribute name |

#### Returns

| Type | Description |
| -- | -- |
| `string|null` | The attribute value or null if not present |

### .hasAttr() {#method-hasattr}

Checks if an element has an attribute.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `target` | `element` | The target element |
| `attr` | `string` | The attribute name |

#### Returns

| Type | Description |
| -- | -- |
| `boolean` | True if the element has the attribute |

### .removeAttr() {#method-removeattr}

Removes attribute(s) from element(s).

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `target` | `element|NodeList|array` | The target element(s) |
| `attr` | `string|array` | Attribute name(s) to remove |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.removeAttr(element, 'disabled');
Utils.removeAttr(element, ['disabled', 'hidden']);
```
</figure>

### .updateAttr() {#method-updateattr}

Updates an attribute value and stores the original in a data attribute.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `els` | `element|NodeList|array` | The target element(s) |
| `attr` | `string` | The attribute name to update |
| `value` | `string` | The new attribute value |
| `handle` | `string` | A handle used to namespace the backup data attribute |

### .restoreAttr() {#method-restoreattr}

Restores an attribute to its original value from a data attribute.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `els` | `element|NodeList|array` | The target element(s) |
| `attr` | `string` | The attribute name to restore |
| `handle` | `string` | The handle used when the attribute was updated |


### .normalizeAttrs() {#method-normalizeattrs}

Normalizes attribute arguments into name/value pairs. Used by `setAttr()`, so it accepts either a name and value or an object.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `attr` | `string|object` | Attribute name, or an object of attribute name/value pairs |
| `value` | `string` (optional) | Attribute value (when `attr` is a string) |

#### Returns

| Type | Description |
| -- | -- |
| `array` | Array of `[name, value]` pairs |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.normalizeAttrs('id', 'main'); // [['id', 'main']]
Utils.normalizeAttrs({ id: 'main', role: 'tab' }); // [['id', 'main'], ['role', 'tab']]
```
</figure>


<hr class="divider">


## Strings {#strings}

### .camelCase() {#method-camelcase}

Converts a hyphenated or space-separated string to camelCase.

#### Parameters

| Name | Type | Description |
| -- | -- | -- |
| `string` | `string` | The string to convert |

#### Returns

| Type | Description |
| -- | -- |
| `string` | The camelCased string |

#### Examples

<figure class="example js-example" markdown="1">
```js
Utils.camelCase('my-data-attr'); // 'myDataAttr'
Utils.camelCase('background color'); // 'backgroundColor'
```
</figure>

</div>
