---
title: Modal
published: true
visible: true
---

# Modal

Simple modal dialogs.

The trigger must be a link to the id of the element holding the modal content (`<a href="#modal-content">`). The element's content is moved into the dialog while it's open and returned when it closes.

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

Open an element in a modal.

<figure class="demo js-editor" markdown="1">

```html
<!-- Demo coming soon -- >
```

```js
import { Modal, Utils } from 'Formstone';

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

Set instance options by passing a valid object at initialization, or to the public [`.defaults()`](#method-defaults) method. Custom options for a specific instance can also be set by attaching a `data-modal-options` attribute containing a properly formatted JSON object to the target element.

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `customClass` | `string` | `''` | Custom CSS class for modal dialog |
| `label` | `string` | `null` | Accessible name for the dialog; when not set, the first heading in the content is used, then `'Dialog'` |
| `returnFocus` | `boolean` | `true` | Return focus to trigger after closing |
| `templates` | `object` | `...` | HTML templates for modal components |


<hr class="divider">


## Methods {#methods}

Methods are publicly available to all active instances, unless otherwise stated.

| Name | Description |
| -- | -- |
| [`.close()`](#method-close) | Closes active modal instance |
| [`.construct()`](#method-construct) | Initializes Modal on target elements |
| [`.defaults()`](#method-defaults) | Sets default options for future Modal instances |
| [`.destroy()`](#method-destroy) | Removes instance and all related data |
| [`.open()`](#method-open) | Opens modal instance |


### .close() {#method-close}

Closes active modal instance.

#### Returns

| Type | Description |
| -- | -- |
| `Promise` | Promise that resolves when the close transition completes; resolves immediately if the modal isn't open |

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Modal.close();
```
</figure>


### .construct() {#method-construct}

Initializes Modal on target elements.

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
let targets = Modal.construct('.js-modal');
```
</figure>

<figure class="example js-example" markdown="1">
```js
let targets = Modal.construct('.js-modal', {
  customClass: 'custom-modal'
});
```
</figure>


### .defaults() {#method-defaults}

Sets default options for future Modal instances.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `options` | `object` (required) | `{}` | Object containing default [options](#options) |

#### Examples

<figure class="example js-example" markdown="1">
```js
Modal.defaults({
  customClass: 'my-modal',
  returnFocus: false
});
```
</figure>


### .destroy() {#method-destroy}

Removes instance and all related data.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Modal.destroy();
```
</figure>


### .open() {#method-open}

Opens instance.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Modal.open();
```
</figure>


<hr class="divider">


## Events {#events}

Events are triggered on the window object.

| Name | Description |
| -- | -- |
| `modal:open` | Modal opened; `detail.el` is the trigger element |
| `modal:close` | Modal closed; `detail.el` is the trigger element |

### Commands {#events-commands}

Dispatch `modal:close` on the window object to close the open modal, for example from custom controls.

<figure class="example js-example" markdown="1">
```js
Utils.trigger(window, 'modal:close');
```
</figure>

`modal:close` is both a command and the notification fired once the modal has closed, so a `modal:close` listener also runs when a close is requested. Only the notification has `detail.el`.

Elements inside the modal content with the class `fs-modal-trigger-close` close the modal when clicked.


<hr class="divider">


## Styles {#styles}

CSS custom properties are used to modify default styles.

| Property | Default | Description |
| -- | -- | -- |
| `--fs-modal-duration` | `0.25s` | Modal transition duration |
| `--fs-modal-timing` | `linear` | Modal transition timing |
| `--fs-modal-overlay-bg` | `rgba(0, 0, 0, 0.9)` | Overlay background color |
| `--fs-modal-container-bg` | `#fff` | Content container background |
| `--fs-modal-button-background` | `#fff` | Close button background |
| `--fs-modal-button-color` | `#000` | Close button icon color |

Classes allow deeper customization and indicate the current state of a specific instance.

| Classname | Type | Description |
| -- | -- | -- |
| `.fs-modal` | `element` | Modal element |
| `.fs-modal-container` | `element` | Content container element |
| `.fs-modal-wrap` | `element` | Content wrapper element |
| `.fs-modal-frame` | `element` | Content frame element |
| `.fs-modal-close` | `element` | Close button element |
| `.fs-modal-open` | `modifier` | Indicates open state |

The page behind an open modal doesn't scroll (`html:has(.fs-modal[open])`).


</div>
