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

Demos coming soon.

<!-- <div class="docs_menu" markdown="1">

* [Basic](#demo-basic)

</div>

### Basic {#demo-basic}

Open an image in a lightbox.

<figure class="demo js-editor" markdown="1">

```html
<!-- Demo coming soon -- >
```

```js
import { Lightbox, Utils } from 'Formstone';

Utils.ready(() => {
  // Demo coming soon
});
```

```css
/* Demo coming soon */
```

</figure> -->


<hr class="divider">

<div class="docs" markdown="1">


## Options {#options}

Set instance options by passing a valid object at initialization, or to the public [`.defaults()`](#method-defaults) method. Custom options for a specific instance can also be set by attaching a `data-lightbox-options` attribute containing a properly formatted JSON object to the target element.

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `customClass` | `string` | `''` | Custom CSS class for lightbox dialog |
| `direction` | `string` | `document.dir` | Content direction (ltr, rtl) |
| `fileTypes` | `RegExp` | `/\.(jpg\|sjpg\|jpeg\|png\|gif\|webp)/i` | Supported image file extensions |
| `label` | `string` | `'Gallery'` | Accessibility label |
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
| `data-lightbox-caption` | `string` | Caption text to display |


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
| `Promise` | Promise that resolves when close transition completes |

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
| `index` | `number` (optional) | `undefined` | Starting index |

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

Events are triggered on the window object.

| Name | Description |
| -- | -- |
| `lightbox:open` | Lightbox opened |
| `lightbox:close` | Lightbox closed |


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


</div>