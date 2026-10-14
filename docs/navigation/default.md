---
title: Navigation
published: true
visible: true
---

# Navigation

Responsive navigation menus.

<div class="docs_menu" markdown="1">

* [Demos](#demo)
* [Options](#options)
* [Methods](#methods)
* [Events](#events)
* [Styles](#styles)

</div>


<hr class="divider">


## Demos {#demo}

<div class="docs_menu" markdown="1">

* [Toggle](#demo-toggle)
* [Overlay](#demo-overlay)
* [Push](#demo-push)
* [Reveal](#demo-reveal)

</div>

### Toggle {#demo-toggle}

The handle shows and hides the navigation in place. These demos set `maxWidth: Infinity` so they're always enabled; by default navigation is only enabled below 980px.

<figure class="demo js-editor" markdown="1">

```html
<div class="demo_page">
  <button type="button" class="demo_button" id="toggle-handle">Menu</button>

  <nav class="demo_nav js-navigation"
    data-navigation-handle="#toggle-handle"
  >
    <a href="#">One</a>
    <a href="#">Two</a>
    <a href="#">Three</a>
  </nav>

  <p>Page content.</p>
</div>
```

```js
import { Navigation, Utils } from 'formstone';

Utils.ready(() => {
  Navigation.construct('.js-navigation', {
    type: 'toggle',
    maxWidth: Infinity, // Always enabled in this demo (default: below 980px)
  });
});
```

```css
body {
  margin: 0;
}

.demo_button {
  background: var(--color-yellow);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  color: var(--color-black);
  cursor: pointer;
  display: inline-block;
  font: inherit;
  padding: 10px 20px;
  text-decoration: none;
}

/* Theme off-canvas navigation; set on both the navigation and the content */
.demo_nav,
.demo_page {
  --fs-navigation-offscreen-width: 260px;
  --fs-navigation-offscreen-background: var(--color-white);
}

.demo_page {
  background: var(--color-gray-10);
  min-height: 100vh;
  padding: 5vh 5vw;
}

.demo_nav {
  box-sizing: border-box;
  padding: 20px;
}

.demo_nav a {
  background: var(--color-blue);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  color: var(--color-black);
  display: block;
  margin-bottom: 10px;
  padding: 10px 15px;
  text-decoration: none;
}

.fs-navigation-handle.fs-navigation-open {
  background: var(--color-red);
}
```

</figure>

### Overlay {#demo-overlay}

The navigation slides in over the page content. While open, the rest of the page is inert; click outside or press Escape to close.

<figure class="demo js-editor" markdown="1">

```html
<div class="demo_page" id="overlay-content">
  <button type="button" class="demo_button" id="overlay-left-handle">Menu Left</button>
  <button type="button" class="demo_button" id="overlay-right-handle">Menu Right</button>
  <p>Page content.</p>
</div>

<nav class="demo_nav js-navigation"
  data-navigation-handle="#overlay-left-handle"
  data-navigation-content="#overlay-content"
  data-navigation-options='{"gravity":"left"}'
>
    <a href="#">One</a>
    <a href="#">Two</a>
    <a href="#">Three</a>
</nav>

<nav class="demo_nav js-navigation"
  data-navigation-handle="#overlay-right-handle"
  data-navigation-content="#overlay-content"
  data-navigation-options='{"gravity":"right"}'
>
    <a href="#">One</a>
    <a href="#">Two</a>
    <a href="#">Three</a>
</nav>
```

```js
import { Navigation, Utils } from 'formstone';

Utils.ready(() => {
  Navigation.construct('.js-navigation', {
    type: 'overlay',
    maxWidth: Infinity, // Always enabled in this demo (default: below 980px)
  });
});
```

```css
body {
  margin: 0;
}

.demo_button {
  background: var(--color-yellow);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  color: var(--color-black);
  cursor: pointer;
  display: inline-block;
  font: inherit;
  padding: 10px 20px;
  text-decoration: none;
}

/* Theme off-canvas navigation; set on both the navigation and the content */
.demo_nav,
.demo_page {
  --fs-navigation-offscreen-width: 260px;
  --fs-navigation-offscreen-background: var(--color-white);
}

.demo_page {
  background: var(--color-gray-10);
  min-height: 100vh;
  padding: 5vh 5vw;
}

.demo_nav {
  box-sizing: border-box;
  padding: 20px;
}

.demo_nav a {
  background: var(--color-blue);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  color: var(--color-black);
  display: block;
  margin-bottom: 10px;
  padding: 10px 15px;
  text-decoration: none;
}

.fs-navigation-handle.fs-navigation-open {
  background: var(--color-red);
}
```

</figure>

### Push {#demo-push}

The navigation slides in and pushes the page content aside.

<figure class="demo js-editor" markdown="1">

```html
<div class="demo_page" id="push-content">
  <button type="button" class="demo_button" id="push-left-handle">Menu Left</button>
  <button type="button" class="demo_button" id="push-right-handle">Menu Right</button>
  <p>Page content.</p>
</div>

<nav class="demo_nav js-navigation"
  data-navigation-handle="#push-left-handle"
  data-navigation-content="#push-content"
  data-navigation-options='{"gravity":"left"}'
>
    <a href="#">One</a>
    <a href="#">Two</a>
    <a href="#">Three</a>
</nav>

<nav class="demo_nav js-navigation"
  data-navigation-handle="#push-right-handle"
  data-navigation-content="#push-content"
  data-navigation-options='{"gravity":"right"}'
>
    <a href="#">One</a>
    <a href="#">Two</a>
    <a href="#">Three</a>
</nav>
```

```js
import { Navigation, Utils } from 'formstone';

Utils.ready(() => {
  Navigation.construct('.js-navigation', {
    type: 'push',
    maxWidth: Infinity, // Always enabled in this demo (default: below 980px)
  });
});
```

```css
body {
  margin: 0;
}

.demo_button {
  background: var(--color-yellow);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  color: var(--color-black);
  cursor: pointer;
  display: inline-block;
  font: inherit;
  padding: 10px 20px;
  text-decoration: none;
}

/* Theme off-canvas navigation; set on both the navigation and the content */
.demo_nav,
.demo_page {
  --fs-navigation-offscreen-width: 260px;
  --fs-navigation-offscreen-background: var(--color-white);
}

.demo_page {
  background: var(--color-gray-10);
  min-height: 100vh;
  padding: 5vh 5vw;
}

.demo_nav {
  box-sizing: border-box;
  padding: 20px;
}

.demo_nav a {
  background: var(--color-blue);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  color: var(--color-black);
  display: block;
  margin-bottom: 10px;
  padding: 10px 15px;
  text-decoration: none;
}

.fs-navigation-handle.fs-navigation-open {
  background: var(--color-red);
}
```

</figure>

### Reveal {#demo-reveal}

The page content slides aside to reveal the navigation underneath.

<figure class="demo js-editor" markdown="1">

```html
<div class="demo_page" id="reveal-content">
  <button type="button" class="demo_button" id="reveal-left-handle">Menu Left</button>
  <button type="button" class="demo_button" id="reveal-right-handle">Menu Right</button>
  <p>Page content.</p>
</div>

<nav class="demo_nav js-navigation"
  data-navigation-handle="#reveal-left-handle"
  data-navigation-content="#reveal-content"
  data-navigation-options='{"gravity":"left"}'
>
    <a href="#">One</a>
    <a href="#">Two</a>
    <a href="#">Three</a>
</nav>

<nav class="demo_nav js-navigation"
  data-navigation-handle="#reveal-right-handle"
  data-navigation-content="#reveal-content"
  data-navigation-options='{"gravity":"right"}'
>
    <a href="#">One</a>
    <a href="#">Two</a>
    <a href="#">Three</a>
</nav>
```

```js
import { Navigation, Utils } from 'formstone';

Utils.ready(() => {
  Navigation.construct('.js-navigation', {
    type: 'reveal',
    maxWidth: Infinity, // Always enabled in this demo (default: below 980px)
  });
});
```

```css
body {
  margin: 0;
}

.demo_button {
  background: var(--color-yellow);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  color: var(--color-black);
  cursor: pointer;
  display: inline-block;
  font: inherit;
  padding: 10px 20px;
  text-decoration: none;
}

/* Theme off-canvas navigation; set on both the navigation and the content */
.demo_nav,
.demo_page {
  --fs-navigation-offscreen-width: 260px;
  --fs-navigation-offscreen-background: var(--color-white);
}

.demo_page {
  background: var(--color-gray-10);
  min-height: 100vh;
  padding: 5vh 5vw;
}

.demo_nav {
  box-sizing: border-box;
  padding: 20px;
}

.demo_nav a {
  background: var(--color-blue);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  color: var(--color-black);
  display: block;
  margin-bottom: 10px;
  padding: 10px 15px;
  text-decoration: none;
}

.fs-navigation-handle.fs-navigation-open {
  background: var(--color-red);
}
```

</figure>


<hr class="divider">

<div class="docs" markdown="1">


## Options {#options}

Set instance options by passing a valid object at initialization, or to the public [`.defaults()`](#method-defaults) method. Custom options for a specific instance can also be set by attaching a `data-navigation-options` attribute containing a properly formatted JSON object to the target element.

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `gravity` | `string` | `'left'` | Navigation gravity (left, right) |
| `label` | `string` | `'Menu'` | Accessibility label |
| `maxWidth` | `string` | `'980px'` | Width to auto-disable instance |
| `type` | `string` | `'toggle'` | Navigation type (toggle, push, reveal, overlay) |
| `focusables` | `string` | `'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'` | Focusable elements |

Data attributes provide configuration options and can be set directly on the target element.

| Name | Type | Description |
| -- | -- | -- |
| `data-navigation-options` | `string` (JSON) | JSON encoded object containing [instance options](#options) |
| `data-navigation-handle` | `string` | Selector for navigation handle element (required; a console warning is logged when missing) |
| `data-navigation-content` | `string` | Selector for content element (required for `push` and `reveal`) |

While a `push`, `reveal` or `overlay` navigation is open it behaves as a modal dialog: the rest of the page is made [`inert`](https://developer.mozilla.org/docs/Web/HTML/Global_attributes/inert), which hides it from assistive technologies and keeps focus inside the navigation. Clicking outside or pressing Escape closes it and returns focus to the handle. Handles get `aria-expanded` for every type and `aria-haspopup="dialog"` for modal types.


<hr class="divider">


## Methods {#methods}

Methods are publicly available to all active instances, unless otherwise stated.

| Name | Description |
| -- | -- |
| [`.close()`](#method-close) | Closes navigation instance |
| [`.construct()`](#method-construct) | Initializes Navigation on target elements |
| [`.defaults()`](#method-defaults) | Sets default options for future instances |
| [`.destroy()`](#method-destroy) | Removes instance and all related data |
| [`.disable()`](#method-disable) | Disables navigation instance |
| [`.enable()`](#method-enable) | Enables navigation instance |
| [`.open()`](#method-open) | Opens navigation instance |


### .close() {#method-close}

Closes instance.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Navigation.close();
```
</figure>


### .construct() {#method-construct}

Initializes Navigation on target elements.

#### Returns

| Type | Description |
| -- | -- |
| `NodeList` | NodeList of target elements |

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `selector` | `string` (required) | `''` | Selector string to target |
| `options` | `object` (optional) | `{}` | Object containing [instance options](#options) |

#### Examples

<figure class="example js-example" markdown="1">
```js
let targets = Navigation.construct('.js-navigation');
Navigation.construct('.js-navigation', { type: 'overlay' });
```
</figure>


### .defaults() {#method-defaults}

Sets default options for future initialization.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `options` | `object` (required) | `{}` | Object containing default options |

#### Examples

<figure class="example js-example" markdown="1">
```js
Navigation.defaults({
  type: 'push'
});
```
</figure>


### .destroy() {#method-destroy}

Removes instance and all related data.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Navigation.destroy();
```
</figure>


### .disable() {#method-disable}

Disables instance.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Navigation.disable();
```
</figure>


### .enable() {#method-enable}

Enables instance.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Navigation.enable();
```
</figure>


### .open() {#method-open}

Opens instance.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Navigation.open();
```
</figure>


<hr class="divider">


## Events {#events}

Events are triggered on the target instance's element, unless otherwise stated.

| Name | Description |
| -- | -- |
| `navigation:open` | Instance opened |
| `navigation:close` | Instance closed |


<hr class="divider">


## Styles {#styles}

CSS custom properties are used to modify default styles. Set the `--fs-navigation-offscreen-*` properties on both the navigation and the content element, since the content uses the same width to move aside.

| Property | Default | Description |
| -- | -- | -- |
| `--fs-navigation-offscreen-background` | `#fff` | Offscreen menu background |
| `--fs-navigation-offscreen-width` | `80vw` | Offscreen menu width |
| `--fs-navigation-offscreen-zindex` | `0` | Offscreen menu z-index |
| `--fs-navigation-offscreen-duration` | `0.2s` | Offscreen transition duration |
| `--fs-navigation-offscreen-timing` | `ease` | Offscreen transition timing |
| `--fs-navigation-overlay-zindex` | `3` | Overlay navigation z-index |
| `--fs-navigation-overlay-content-background` | `rgba(0, 0, 0, 0.8)` | Overlay content background |
| `--fs-navigation-overlay-content-zindex` | `2` | Overlay content z-index |
| `--fs-navigation-push-zindex` | `0` | Push navigation z-index |
| `--fs-navigation-push-content-zindex` | `1` | Push content z-index |

Classes allow deeper customization and indicate the current state of a specific instance.

| Classname | Type | Description |
| -- | -- | -- |
| `.fs-navigation` | `element` | Target element |
| `.fs-navigation-handle` | `element` | Handle element |
| `.fs-navigation-content` | `element` | Content element |
| `.fs-navigation-enabled` | `modifier` | Indicates enabled state |
| `.fs-navigation-open` | `modifier` | Indicates open state |
| `.fs-navigation-closed` | `modifier` | Indicates closed state |
| `.fs-navigation-animated` | `modifier` | Indicates animated state |
| `.fs-navigation-{type}-nav` | `modifier` | Navigation type on the navigation element (`toggle`, `push`, `reveal` or `overlay`) |
| `.fs-navigation-{type}-handle` | `modifier` | Navigation type on the handle |
| `.fs-navigation-{type}-content` | `modifier` | Navigation type on the content element |
| `.fs-navigation-{type}-{gravity}-nav` | `modifier` | Gravity (`left` or `right`) on the navigation element; not added for `toggle` |
| `.fs-navigation-{type}-{gravity}-handle` | `modifier` | Gravity on the handle; not added for `toggle` |
| `.fs-navigation-{type}-{gravity}-content` | `modifier` | Gravity on the content element while open; not added for `toggle` |

For example, `type: 'push', gravity: 'right'` adds `.fs-navigation-push-nav` and `.fs-navigation-push-right-nav` to the navigation, `.fs-navigation-push-handle` and `.fs-navigation-push-right-handle` to the handle, `.fs-navigation-push-content` to the content, and `.fs-navigation-push-right-content` to the content while open.


</div>
