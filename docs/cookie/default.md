---
title: Cookie
published: true
visible: true
---

# Cookie

Simple cookie management.

<div class="docs_menu" markdown="1">

* [Demos](#demo)
* [Options](#options)
* [Methods](#methods)

</div>


<hr class="divider">


## Demos {#demo}

<div class="docs_menu" markdown="1">

* [Basic](#demo-basic)

</div>

### Basic {#demo-basic}

Create, read, and remove cookies. Cookies are no longer support in CodePen embeds, but the following will work in your browser's console. Feel free to play around there.

<figure class="example js-example" markdown="1">
```js
Cookie.set('foo', 'bar');
Cookie.set('fizz', 'bat');

console.log(Cookie.get('foo')); // bar
console.log(Cookie.get('fizz')); // baz

Cookie.delete('foo');

console.log(Cookie.get('foo')); // null
```
</figure>

<!-- <figure class="demo js-editor" markdown="1">

```html
<form action="#" medthod="GET" class="form">
  <div class="">
      <h2>Set Cookie</h2>
      <label class="label" for="set_key">Key</label>
      <input type="text" name="set_key" id="set_key" value="foo" class="input js-set_key">
      <label class="label" for="set_value">Value</label>
      <input type="text" name="set_value" id="set_value" value="bar" class="input js-set_value">
      <button type="button" class="button js-set_cookie">
        Set
      </button>
  </div>
  <div class="">
      <h2>Get Cookie</h2>
      <label class="label" for="get_key">Key</label>
      <input type="text" name="get_key" id="get_key" value="foo" class="input js-get_key">
      <button type="button" class="button js-get_cookie">
        Get
      </button>
  </div>
  <div class="fs-cell fs-xs-full fs-sm-third fs-md-third fs-lg-third">
      <h2>Delete Cookie</h2>
      <label class="label" for="delete_key">Key</label>
      <input type="text" name="delete_key" id="delete_key" value="foo" class="input js-delete_key">
      <button type="button" class="button js-delete_cookie">
        Delete
      </button>
  </div>
</form>
<div class="output js-output"><span></span></div>
```

```js
import { Cookie, Utils } from 'formstone';

Utils.ready(() => {
  Utils.on(Utils.select('.js-set_cookie'), 'click', () => {
    let key = Utils.select('.js-set_key')[0].value;
    let value = Utils.select('.js-set_value')[0].value;

    Cookie.set(key, value, {});

    log('Set', `${key} = ${value}`);
  });

  Utils.on(Utils.select('.js-get_cookie'), 'click', () => {
    let key = Utils.select('.js-get_key')[0].value;
    let value = Cookie.get(key);

    console.log(key);

    log('Get', `${key} = ${value}`);
  });

  Utils.on(Utils.select('.js-delete_cookie'), 'click', () => {
    let key = Utils.select('.js-delete_key')[0].value;

    Cookie.delete(key);

    log('Delete', `${key}`);
  });
});

function log(label, value) {
  let output = Utils.select('.js-output');

  Utils.prepend(output[0], document.createElement('br').outerHTML); // Fix decoding issue in demo
  Utils.prepend(output[0], `${label}: ${value}`);
}

```

```css
/* Demo */
```

</figure> -->


<hr class="divider">

<div class="docs" markdown="1">


## Options {#options}

Set global options by passing a valid object to the public [`.defaults()`](#method-defaults) method.

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `domain` | `string` | `null` | Cookie domain |
| `expires` | `number` | `604800000` | Expiration time in milliseconds (default 7 days) |
| `path` | `string` | `null` | Cookie path |
| `samesite` | `string` | `'Lax'` | SameSite attribute ('Strict', 'Lax', or 'None') |
| `secure` | `boolean` | `null` | Secure attribute (requires HTTPS) |


<hr class="divider">


## Methods {#methods}

Methods are publicly available, unless otherwise stated.

| Name | Description |
| -- | -- |
| [`.defaults()`](#method-defaults) | Sets default options for all future cookie operations |
| [`.set()`](#method-set) | Sets a cookie value |
| [`.get()`](#method-get) | Gets a cookie value by key |
| [`.delete()`](#method-delete) | Deletes a cookie |


### .defaults() {#method-defaults}

Sets default options for all future cookie operations.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `options` | `object` (required) | `{}` | Object containing default [options](#options) |

#### Examples

<figure class="example js-example" markdown="1">
```js
Cookie.defaults({
  expires: 3600000, // 1 hour
  secure: true
});
```
</figure>


### .set() {#method-set}

Sets a cookie value.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `key` | `string` (required) | `''` | Cookie key/name |
| `value` | `string` (required) | `''` | Cookie value |
| `options` | `object` (optional) | `{}` | Object containing [options](#options) |

#### Examples

<figure class="example js-example" markdown="1">
```js
// Set a basic cookie
Cookie.set('username', 'john');
```
</figure>

<figure class="example js-example" markdown="1">
```js
// Set a cookie with custom options
Cookie.set('token', 'abc123', {
  expires: 3600000, // 1 hour
  secure: true,
  samesite: 'Strict'
});
```
</figure>


### .get() {#method-get}

Gets a cookie value by key.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `key` | `string` (required) | `''` | Cookie key/name |

#### Returns

| Type | Description |
| -- | -- |
| `string|null` | Cookie value or null if not found |

#### Examples

<figure class="example js-example" markdown="1">
```js
let username = Cookie.get('username');
if (username) {
  console.log('Welcome back, ' + username);
}
```
</figure>


### .delete() {#method-delete}

Deletes a cookie by setting its expiration to the past.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `key` | `string` (required) | `''` | Cookie key/name |
| `options` | `object` (optional) | `{}` | Object containing [options](#options) (domain and path should match the original cookie) |

#### Examples

<figure class="example js-example" markdown="1">
```js
Cookie.delete('username');
```
</figure>

<figure class="example js-example" markdown="1">
```js
// Delete cookie with specific domain/path
Cookie.delete('token', {
  domain: '.example.com',
  path: '/'
});
```
</figure>

</div>