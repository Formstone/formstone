---
title: Lightbox
published: true
visible: true
---

# Lightbox

Accessible lightbox for images, videos, and elements.

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

* [Basic](#demo-basic)
* [Gallery](#demo-gallery)
* [Loop](#demo-loop)
* [Video](#demo-video)
* [Inline Content & URLs](#demo-inline)

</div>

### Basic {#demo-basic}

Open an image in a lightbox. The `title` (or `data-lightbox-caption`) becomes the caption.

<figure class="demo js-editor" markdown="1">

```html
<div class="demo_set">
  <a href="https://spaceholder.dev/1600x900/1.jpg" class="demo_thumb js-lightbox"
    title="Ultricies Ipsum Purus Vulputate"
  >
    <img src="https://spaceholder.dev/400x300/1.jpg" alt="Ultricies Ipsum Purus Vulputate">
  </a>
  <a href="https://spaceholder.dev/1600x900/2.jpg" class="demo_thumb js-lightbox"
    data-lightbox-caption="Nulla vitae elit libero, a pharetra augue."
  >
    <img src="https://spaceholder.dev/400x300/2.jpg" alt="Nulla vitae elit libero, a pharetra augue.">
  </a>
</div>
```

```js
import { Lightbox, Utils } from 'formstone';

Utils.ready(() => {
  Lightbox.construct('.js-lightbox');
});
```

```css
body {
  padding: 5vh 5vw;
}

.demo_set {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.demo_thumb {
  box-sizing: border-box;
  flex: 0 0 calc(33.333% - 14px);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  overflow: hidden;
}

.demo_thumb img {
  display: block;
  width: 100%;
  height: auto;
}
```

</figure>

### Gallery {#demo-gallery}

Group links with `data-lightbox-gallery` to page through them with the controls, arrow keys or swipes.

<figure class="demo js-editor" markdown="1">

```html
<div class="demo_set">
  <a href="https://spaceholder.dev/1600x900/7.jpg" class="demo_thumb js-lightbox"
    data-lightbox-gallery="gallery"
    title="Duis mollis, est non commodo luctus"
  >
    <img src="https://spaceholder.dev/400x300/7.jpg" alt="Duis mollis, est non commodo luctus">
  </a>
  <a href="https://spaceholder.dev/900x900/8.jpg" class="demo_thumb js-lightbox"
    data-lightbox-gallery="gallery"
    title="Nullam id dolor id nibh ultricies vehicula"
  >
    <img src="https://spaceholder.dev/400x300/8.jpg" alt="Nullam id dolor id nibh ultricies vehicula">
  </a>
  <a href="https://spaceholder.dev/1600x900/9.jpg" class="demo_thumb js-lightbox"
    data-lightbox-gallery="gallery"
    title="Etiam porta sem malesuada magna mollis euismod"
  >
    <img src="https://spaceholder.dev/400x300/9.jpg" alt="Etiam porta sem malesuada magna mollis euismod">
  </a>
</div>
```

```js
import { Lightbox, Utils } from 'formstone';

Utils.ready(() => {
  Lightbox.construct('.js-lightbox');
});
```

```css
body {
  padding: 5vh 5vw;
}

.demo_set {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.demo_thumb {
  box-sizing: border-box;
  flex: 0 0 calc(33.333% - 14px);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  overflow: hidden;
}

.demo_thumb img {
  display: block;
  width: 100%;
  height: auto;
}
```

</figure>

### Loop {#demo-loop}

Set `loop` to go from the last item back to the first.

<figure class="demo js-editor" markdown="1">

```html
<div class="demo_set">
  <a href="https://spaceholder.dev/1600x900/4.jpg" class="demo_thumb js-lightbox"
    data-lightbox-gallery="loop"
  >
    <img src="https://spaceholder.dev/400x300/4.jpg" alt="Gallery image 1">
  </a>
  <a href="https://spaceholder.dev/1600x900/5.jpg" class="demo_thumb js-lightbox"
    data-lightbox-gallery="loop"
  >
    <img src="https://spaceholder.dev/400x300/5.jpg" alt="Gallery image 2">
  </a>
  <a href="https://spaceholder.dev/1600x900/6.jpg" class="demo_thumb js-lightbox"
    data-lightbox-gallery="loop"
  >
    <img src="https://spaceholder.dev/400x300/6.jpg" alt="Gallery image 3">
  </a>
</div>
```

```js
import { Lightbox, Utils } from 'formstone';

Utils.ready(() => {
  Lightbox.construct('.js-lightbox', {
    loop: true,
  });
});
```

```css
body {
  padding: 5vh 5vw;
}

.demo_set {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.demo_thumb {
  box-sizing: border-box;
  flex: 0 0 calc(33.333% - 14px);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  overflow: hidden;
}

.demo_thumb img {
  display: block;
  width: 100%;
  height: auto;
}
```

</figure>

### Video {#demo-video}

YouTube and Vimeo links open as embedded players. The video stops when the lightbox closes or moves to another item.

<figure class="demo js-editor" markdown="1">

```html
<div class="demo_set">
  <a href="https://www.youtube.com/watch?v=Ga6RYejo6Hk" class="demo_thumb js-lightbox"
    data-lightbox-gallery="video"
    data-lightbox-caption="YouTube"
  >
    <img src="https://spaceholder.dev/400x300/1.jpg" alt="Play YouTube video">
  </a>
  <a href="https://vimeo.com/115041822" class="demo_thumb js-lightbox"
    data-lightbox-gallery="video"
    data-lightbox-caption="Vimeo"
  >
    <img src="https://spaceholder.dev/400x300/2.jpg" alt="Play Vimeo video">
  </a>
</div>
```

```js
import { Lightbox, Utils } from 'formstone';

Utils.ready(() => {
  Lightbox.construct('.js-lightbox');
});
```

```css
body {
  padding: 5vh 5vw;
}

.demo_set {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.demo_thumb {
  box-sizing: border-box;
  flex: 0 0 calc(33.333% - 14px);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  overflow: hidden;
}

.demo_thumb img {
  display: block;
  width: 100%;
  height: auto;
}
```

</figure>

### Inline Content & URLs {#demo-inline}

Link to an element's id to show its content, or set `data-lightbox-type="url"` to load a page in an iframe. Buttons with the `fs-lightbox-trigger-previous`, `fs-lightbox-trigger-next` and `fs-lightbox-trigger-close` classes control the lightbox.

<figure class="demo js-editor" markdown="1">

```html
<div class="demo_set">
  <a href="#lightbox-inline" class="demo_button js-lightbox"
    data-lightbox-gallery="inline"
    data-lightbox-caption="Inline Content"
  >
    Inline Content
  </a>
  <a href="https://maps.google.com/maps?q=1700%20South%20Rd&amp;z=14&amp;output=embed" class="demo_button js-lightbox"
    data-lightbox-gallery="inline"
    data-lightbox-type="url"
    data-lightbox-caption="Google Map"
  >
    Google Map
  </a>
</div>

<div class="demo_hidden" id="lightbox-inline">
  <div class="demo_content">
    <h2>Adipiscing Vulputate Elit</h2>
    <p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum.</p>
    <button type="button" class="demo_button fs-lightbox-trigger-next">Next</button>
    <button type="button" class="demo_button fs-lightbox-trigger-close">Close</button>
  </div>
</div>
```

```js
import { Lightbox, Utils } from 'formstone';

Utils.ready(() => {
  Lightbox.construct('.js-lightbox');
});
```

```css
body {
  padding: 5vh 5vw;
}

.demo_set {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
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

.demo_hidden {
  display: none;
}

.demo_content {
  background: var(--color-white);
  max-width: 500px;
  padding: 30px;
}
```

</figure>


<hr class="divider">

<div class="docs" markdown="1">


## Options {#options}

Set instance options by passing a valid object at initialization, or to the public [`.defaults()`](#method-defaults) method. Custom options for a specific instance can also be set by attaching a `data-lightbox-options` attribute containing a properly formatted JSON object to the target element.

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `customClass` | `string` | `''` | Custom CSS class for lightbox dialog |
| `direction` | `string` | `null` | Content direction (ltr, rtl); falls back to `document.dir` when the instance is created |
| `fileTypes` | `RegExp` | `/\.(jpe?g\|sjpg\|png\|gif\|webp\|avif\|svg)(?=$\|[?#])/i` | Supported image file extensions, matched at the end of the URL path |
| `label` | `string` | `'Gallery'` | Accessibility label |
| `loop` | `boolean` | `false` | Loop from the last gallery item to the first (and back) |
| `ordinal` | `boolean` | `true` | Show gallery position indicator |
| `threshold` | `number` | `50` | Swipe threshold in pixels |
| `templates` | `object` | `...` | HTML templates for UI components |
| `videoProviders` | `object` | `...` | Video provider patterns and formatters |

Data attributes provide configuration options and can be set directly on the target element.

| Name | Type | Description |
| -- | -- | -- |
| `data-lightbox-options` | `string` (JSON) | JSON encoded object containing [instance options](#options) |
| `data-lightbox-gallery` | `string` | Gallery group identifier for navigation |
| `data-lightbox-type` | `string` | Force content type: 'image', 'video', 'element', or 'url' |
| `data-lightbox-caption` | `string` | Caption text to display (rendered as plain text; falls back to the `title` attribute) |

Gallery links whose `#hash` target doesn't exist are skipped with a console warning.


<hr class="divider">


## Methods {#methods}

Methods are publicly available to all active instances, unless otherwise stated.

| Name | Description |
| -- | -- |
| [`.close()`](#method-close) | Closes active lightbox instance |
| [`.construct()`](#method-construct) | Initializes Lightbox on target elements |
| [`.defaults()`](#method-defaults) | Sets default options for future Lightbox instances |
| [`.destroy()`](#method-destroy) | Removes instance and all related data |
| [`.jump()`](#method-jump) | Jumps to specific gallery index |
| [`.next()`](#method-next) | Advances to next gallery item |
| [`.open()`](#method-open) | Opens lightbox at specified index |
| [`.previous()`](#method-previous) | Goes back to previous gallery item |


### .close() {#method-close}

Closes active lightbox instance.

#### Returns

| Type | Description |
| -- | -- |
| `Promise` | Promise that resolves when the close transition completes; resolves immediately if the lightbox isn't open |

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Lightbox.close();
```
</figure>


### .construct() {#method-construct}

Initializes Lightbox on target elements.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `selector` | `string` (required) | `''` | Selector string to target |
| `options` | `object` (optional) | `{}` | Object containing [instance options](#options) |

#### Returns

| Type | Description |
| -- | -- |
| `NodeList` | NodeList of target elements |

#### Examples

<figure class="example js-example" markdown="1">
```js
let targets = Lightbox.construct('.js-lightbox');
```
</figure>

<figure class="example js-example" markdown="1">
```js
let targets = Lightbox.construct('.js-lightbox', {
  customClass: 'photo-gallery',
  threshold: 100
});
```
</figure>


### .defaults() {#method-defaults}

Sets default options for future Lightbox instances.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `options` | `object` (required) | `{}` | Object containing default [options](#options) |

#### Examples

<figure class="example js-example" markdown="1">
```js
Lightbox.defaults({
  customClass: 'my-lightbox',
  threshold: 100
});
```
</figure>


### .destroy() {#method-destroy}

Removes instance and all related data.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Lightbox.destroy();
```
</figure>


### .jump() {#method-jump}

Jumps to specific gallery index.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `index` | `number` (required) | `0` | Target index |

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Lightbox.jump(2);
```
</figure>


### .next() {#method-next}

Advances to next gallery item.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Lightbox.next();
```
</figure>


### .open() {#method-open}

Opens lightbox at specified index.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `index` | `number` (optional) | `undefined` | Zero-based starting index; out-of-range values are clamped. Defaults to the trigger's position in its gallery |

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Lightbox.open();
```
</figure>

<figure class="example js-example" markdown="1">
```js
el.Lightbox.open(2);
```
</figure>


### .previous() {#method-previous}

Goes back to previous gallery item.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Lightbox.previous();
```
</figure>


<hr class="divider">


## Events {#events}

Events are triggered on the trigger element and on the window object.

| Name | Description |
| -- | -- |
| `lightbox:open` | Lightbox opened; `detail.el` is the trigger element |
| `lightbox:close` | Lightbox closed; `detail.el` is the trigger element |

### Commands {#events-commands}

Dispatch these events on the window object to control the open lightbox, for example from custom controls.

| Name | Description |
| -- | -- |
| `lightbox:previous` | Show the previous item |
| `lightbox:next` | Show the next item |
| `lightbox:close` | Close the lightbox |

<figure class="example js-example" markdown="1">
```js
Utils.trigger(window, 'lightbox:next');
```
</figure>

`lightbox:close` is both a command and the notification fired once the lightbox has closed, so a `lightbox:close` listener also runs when a close is requested. Only the notification has `detail.el`:

<figure class="example js-example" markdown="1">
```js
window.addEventListener('lightbox:close', (e) => {
  if (e.detail && e.detail.el) {
    // Lightbox closed
  }
});
```
</figure>

Elements inside lightbox content with these classes act as controls when clicked: `fs-lightbox-trigger-previous`, `fs-lightbox-trigger-next` and `fs-lightbox-trigger-close`.


<hr class="divider">


## Styles {#styles}

CSS custom properties are used to modify default styles.

| Property | Default | Description |
| -- | -- | -- |
| `--fs-lightbox-duration` | `0.25s` | Lightbox transition duration |
| `--fs-lightbox-timing` | `linear` | Lightbox transition timing |
| `--fs-lightbox-overlay-bg` | `rgba(0, 0, 0, 0.9)` | Overlay background color |
| `--fs-lightbox-loading-color` | `#fff` | Loading spinner color |
| `--fs-lightbox-loading-size` | `40px` | Loading spinner size |
| `--fs-lightbox-loading-spread` | `5px` | Loading spinner thickness |
| `--fs-lightbox-loading-duration` | `0.75s` | Loading spinner animation duration |
| `--fs-lightbox-item-duration` | `0.25s` | Content transition duration |
| `--fs-lightbox-item-timing` | `ease` | Content transition timing |
| `--fs-lightbox-details-bg` | `rgba(0, 0, 0, 0.6)` | Details area background |
| `--fs-lightbox-details-color` | `#fff` | Details area text color |
| `--fs-lightbox-details-font` | `16px / 1.4 sans-serif` | Details area font stack |
| `--fs-lightbox-details-padding` | `...` | Details area padding |
| `--fs-lightbox-details-gap` | `10px` | Details area spacing |
| `--fs-lightbox-button-background` | `rgba(0, 0, 0, 0.8)` | Control button background |
| `--fs-lightbox-button-color` | `#fff` | Control button icon color |

Classes allow deeper customization and indicate the current state of a specific instance.

| Classname | Type | Description |
| -- | -- | -- |
| `.fs-lightbox` | `element` | Dialog element |
| `.fs-lightbox-container` | `element` | Content container element |
| `.fs-lightbox-item` | `element` | Gallery item element |
| `.fs-lightbox-active` | `modifier` | Indicates active state |
| `.fs-lightbox-open` | `modifier` | Indicates open state |
| `.fs-lightbox-error` | `modifier` | Item media failed to load |

The page behind an open lightbox doesn't scroll (`html:has(.fs-lightbox[open])`). `data-lightbox-type="url"` items only load `http` and `https` URLs. Arrow keys don't change items while focus is in a form field or editable content. Escape, the close button, or a click outside the content closes the lightbox.


</div>