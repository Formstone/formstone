---
title: Checkpoint
published: true
visible: true
---

# Checkpoint

Animate elements on scroll.

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

* [Built-In](#demo-built-in)
* [Custom](#demo-custom)
* [Trigger](#demo-trigger)
* [Container](#demo-container)
* [Parent](#demo-parent)

</div>


### Built-In Animations {#demo-built-in}

Use the built-in animations.

<figure class="demo js-editor checkpoint_demo" markdown="1">

```html
<div class="box js-checkpoint"
  data-checkpoint-animation="fade-in"
>
  fade-in
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="fade-up"
>
  fade-up
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="fade-down"
>
  fade-down
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="fade-left"
>
  fade-left
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="fade-right"
>
  fade-right
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="zoom-in"
>
  zoom-in
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="zoom-in-up"
>
  zoom-in-up
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="zoom-in-down"
>
  zoom-in-down
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="zoom-in-left"
>
  zoom-in-left
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="zoom-in-right"
>
  zoom-in-right
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="zoom-out"
>
  zoom-out
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="zoom-out-up"
>
  zoom-out-up
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="zoom-out-down"
>
  zoom-out-down
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="zoom-out-left"
>
  zoom-out-left
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="zoom-out-right"
>
  zoom-in-right
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="flip-up"
>
  flip-up
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="flip-down"
>
  flip-down
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="flip-left"
>
  flip-left
</div>

<div class="box js-checkpoint"
  data-checkpoint-animation="flip-right"
>
  flip-right
</div>

<div class="marker"></div>
```

```js
import { CheckPoint, Utils } from 'formstone';

Utils.ready(() => {
  CheckPoint.construct('.js-checkpoint', {
    offset: '25%',
    reverse: true,
  });
});
```

```css

body {
  padding-bottom: 30vh;
}

body::before {
  align-items: center;
  content: 'Scroll Down\A\21E3';
  display: flex;
  height: 105vh;
  justify-content: center;
  text-align: center;
  white-space: pre-wrap;
}

.box {
  background: var(--color-yellow);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  margin: 0 auto 30vh;
  width: 200px;
  padding: 20px 10px;
  text-align: center;
}

.marker {
  width: 100%;
  height: 0;
  position: fixed;
  bottom: 25vh;
  border: 1px dashed var(--color-blue);
}

.marker::before {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 10px;
  color: var(--color-blue);
  content: 'offset: 25%';
  text-transform: uppercase;
  font-size: 14px;
  line-height: 1;
}
```

</figure>


### Custom Animation {#demo-custom}

Define a custom animation.

<figure class="demo js-editor checkpoint_demo" markdown="1">

```html
<div class="box js-checkpoint"
  data-checkpoint-animation="spinner"
>
  spinner
</div>

<div class="marker"></div>
```

```js
import { CheckPoint, Utils } from 'formstone';

Utils.ready(() => {
  CheckPoint.construct('.js-checkpoint', {
    offset: '25%',
    reverse: true,
  });
});
```

```css
[data-checkpoint-animation="spinner"] {
  --opacity: 0;
  --transform: translate(0, 100%) scale(0.5) rotate(300deg);
  --duration: 0.5s;
  --ease: cubic-bezier(0.47, 1.64, 0.41, 0.8);

  opacity: var(--opacity);
  transform: var(--transform);
  transition:
    opacity var(--duration) linear,
    transform var(--duration) var(--ease);
}

[data-checkpoint-animation="spinner"].fs-checkpoint-active {
  --opacity: 1;
  --transform: translate(0, 0) scale(1) rotate(0deg);
}

body {
  padding-bottom: 30vh;
}

body::before {
  align-items: center;
  content: 'Scroll Down\A\21E3';
  display: flex;
  height: 105vh;
  justify-content: center;
  text-align: center;
  white-space: pre-wrap;
}

.box {
  background: var(--color-yellow);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  margin: 0 auto 30vh;
  width: 200px;
  padding: 20px 10px;
  text-align: center;
}

.marker {
  width: 100%;
  height: 0;
  position: fixed;
  bottom: 25vh;
  border: 1px dashed var(--color-blue);
}

.marker::before {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 10px;
  color: var(--color-blue);
  content: 'offset: 25%';
  text-transform: uppercase;
  font-size: 14px;
  line-height: 1;
}
```

</figure>


### Trigger {#demo-trigger}

Set an element to act as the animation trigger.

<figure class="demo js-editor checkpoint_demo" markdown="1">

```html
<div class="container">
  <div class="box js-checkpoint"
    data-checkpoint-trigger=".trigger"
    data-checkpoint-animation="trigger"
  >
    trigger
  </div>
  <div class="trigger">
    Scroll Trigger
  </div>
</div>

<div class="marker"></div>
```

```js
import { CheckPoint, Utils } from 'formstone';

Utils.ready(() => {
  CheckPoint.construct('.js-checkpoint', {
    offset: '25%',
    reverse: true,
  });
});
```

```css
body {
  background: var(--color-gray-5);
}

body::before {
  align-items: center;
  content: 'Scroll Down\A\21E3';
  display: flex;
  height: 85vh;
  justify-content: center;
  text-align: center;
  white-space: pre-wrap;
}

.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: var(--border-size);
  padding: 10vh;
}

.trigger {
  align-self: flex-end;
  background: var(--color-blue);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  margin: 80vh auto;
  padding: 5px 10px;
  text-align: center;
  width: 200px;
}

.box {
  position: sticky;
  top: 50vh;
  align-self: flex-start;
  background: var(--color-white);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  margin: 0 auto;
  width: 200px;
  padding: 20px 10px;
  text-align: center;
  transform: translate(0, -50%);
}

.box.fs-checkpoint-active {
  background: var(--color-yellow);
}

.marker {
  width: 100%;
  height: 0;
  position: fixed;
  bottom: 25vh;
  border: 1px dashed var(--color-blue);
}

.marker::before {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 10px;
  color: var(--color-blue);
  content: 'offset: 25%';
  text-transform: uppercase;
  font-size: 14px;
  line-height: 1;
}
```

</figure>


### Container {#demo-container}

Set a container to animate elements inside a parent.

<figure class="demo js-editor checkpoint_demo" markdown="1">

```html
<div class="container">
  <div class="box js-checkpoint"
    data-checkpoint-container=".container"
    data-checkpoint-animation="fade-in"
  >
    fade-up
  </div>
</div>

<div class="marker"></div>
```

```js
import { CheckPoint, Utils } from 'formstone';

Utils.ready(() => {
  CheckPoint.construct('.js-checkpoint', {
    offset: '75%',
    reverse: true,
  });
});
```

```css
body {
  background: var(--color-gray-5);
  padding-bottom: 60vh;
}

body::before {
  align-items: center;
  content: 'Scroll Down\A\21E3';
  display: flex;
  height: 85vh;
  justify-content: center;
  text-align: center;
  white-space: pre-wrap;
}

.container {
  display: flex;
  align-items: flex-end;
  height: 50vh;
  margin: 0 10vh 10vh;
  background: var(--color-white);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
}

.box {
  background: var(--color-yellow);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  margin: 0 auto 20px;
  width: 200px;
  padding: 20px 10px;
  text-align: center;
}

.marker {
  width: 100%;
  height: 0;
  position: fixed;
  bottom: 75vh;
  border: 1px dashed var(--color-blue);
}

.marker::before {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 10px;
  color: var(--color-blue);
  content: 'offset: 75%';
  text-transform: uppercase;
  font-size: 14px;
  line-height: 1;
}
```

</figure>


### Parent {#demo-parent}

Set a container to animate elements inside a scrollable parent.

<figure class="demo js-editor checkpoint_demo" markdown="1">

```html
<div class="parent_wrapper">
  <div class="parent">

    <div class="box js-checkpoint"
      data-checkpoint-parent=".parent"
      data-checkpoint-animation="fade-in"
    >
      fade-up
    </div>

    <div class="marker"></div>

  </div>
</div>
```

```js
import { CheckPoint, Utils } from 'formstone';

Utils.ready(() => {
  CheckPoint.construct('.js-checkpoint', {
    offset: '25%',
    reverse: true,
  });
});
```

```css
body {
  background: var(--color-gray-5);
  padding-bottom: 30vh;
}

body::before,
.parent::before {
  align-items: center;
  content: 'Scroll Down\A\21E3';
  display: flex;
  height: 85vh;
  justify-content: center;
  text-align: center;
  white-space: pre-wrap;
}

body::before {
  height: 75vh;
}

.parent {
  overflow-y: scroll;
  height: 80vh;
  margin: 10vh;
  background: var(--color-white);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  padding-bottom: 30vh;
}

.parent_wrapper {
  position: relative;
}

.box {
  background: var(--color-yellow);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  margin: 0 auto 30vh;
  width: 200px;
  padding: 20px 10px;
  text-align: center;
}

.marker {
  width: calc(100% - 20vh - 4px);
  height: 0;
  position: absolute;
  bottom: 25%;
  border: 1px dashed var(--color-blue);
}

.marker::before {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 10px;
  color: var(--color-blue);
  content: 'offset: 25%';
  text-transform: uppercase;
  font-size: 14px;
  line-height: 1;
}
```

</figure>


<hr class="divider">

<div class="docs" markdown="1">


## Options {#options}

Set instance options by passing a valid object at initialization, or to the public [`.defaults()`](#method-defaults) method. Custom options for a specific instance can also be set by attaching a `data-checkpoint-options` attribute containing a properly formatted JSON object to the target element.

| Name | Type | Default | Description |
| -- | -- | -- | --|
| `offset` | `string` | `'0px'` | Element offset for activating animation (pixels or percentage) |
| `reverse` | `boolean` | `false` | Deactivate animation when scrolling back |

Data attributes provide additional configuration options and can be set directly on the target element.

| Name | Type | Description |
| -- | -- | -- |
| `data-checkpoint-options` | `string` (JSON) | JSON encoded object containing [instance options](#options) |
| `data-checkpoint-animation` | `string` | Animation type (e.g., `fade-in`, `zoom-in-up`, `flip-left`) |
| `data-checkpoint-offset` | `string` | Custom offset value, overrides the option (pixels or percentage) |
| `data-checkpoint-parent` | `string` | Selector for a scrollable parent container |
| `data-checkpoint-trigger` | `string` | Selector for a custom trigger element |
| `data-checkpoint-container` | `string` | Selector for parent trigger element |


<hr class="divider">


## Methods {#methods}

Methods are publicly available to all active instances, unless otherwise stated.

| Name | Description |
| -- | -- |
| [`.construct()`](#method-construct) | Initializes CheckPoint plugin on target elements |
| [`.defaults()`](#method-defaults) | Sets default options for future CheckPoint instances |
| [`.destroy()`](#method-destroy) | Removes plugin and all related data |
| [`.enable()`](#method-enable) | Enables the CheckPoint instance |
| [`.disable()`](#method-disable) | Disables the CheckPoint instance |
| [`.activate()`](#method-activate) | Activates the checkpoint animation |
| [`.deactivate()`](#method-deactivate) | Deactivates the checkpoint animation |


### .construct() {#method-construct}

Initializes CheckPoint plugin on target elements.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | --|
| `selector` | `string` (required) | `''` | Selector string to target |
| `options` | `object` (optional) | `{}` | Object containing [instance options](#options) |

#### Returns

| Type | Description |
| -- | -- |
| `NodeList` | NodeList of target elements |

#### Examples

<figure class="example js-example" markdown="1">
```js
let targets = CheckPoint.construct('.js-checkpoint');
```
</figure>

<figure class="example js-example" markdown="1">
```js
let targets = CheckPoint.construct('.js-checkpoint', {
  reverse: true
});
```
</figure>


### .defaults() {#method-defaults}

Sets default options for future CheckPoint instances.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | --|
| `options` | `object` (required) | `{}` | Object containing default [options](#options) |

#### Examples

<figure class="example js-example" markdown="1">
```js
CheckPoint.defaults({
  reverse: true
});
```
</figure>


### .destroy() {#method-destroy}

Removes plugin and all related data.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.CheckPoint.destroy();
```
</figure>


### .enable() {#method-enable}

Enables the CheckPoint instance.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.CheckPoint.enable();
```
</figure>


### .disable() {#method-disable}

Disables the CheckPoint instance.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.CheckPoint.disable();
```
</figure>


### .activate() {#method-activate}

Activates the checkpoint animation.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.CheckPoint.activate();
```
</figure>


### .deactivate() {#method-deactivate}

Deactivates the checkpoint animation.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.CheckPoint.deactivate();
```
</figure>


<hr class="divider">


## Events {#events}

Events are triggered on the target instance's element, unless otherwise stated.

| Name | Description |
| -- | --|
| `checkpoint:activate` | Checkpoint animation activated |
| `checkpoint:deactivate` | Checkpoint animation deactivated |


<hr class="divider">


## Styles {#styles}

CSS custom properties are used to modify default styles.

| Property | Default | Description |
| -- | -- | -- |
| `--fs-checkpoint-duration` | `0.5s` | Transition duration (all animations) |
| `--fs-checkpoint-distance` | `50px` | Translate distance (fade, zoom) |
| `--fs-checkpoint-perspective` | `3000px` | Perspective value (flip) |
| `--fs-checkpoint-rotate` | `90deg` | Rotation amount (flip) |
| `--fs-checkpoint-scale-in` | `0.5` | Scale amount (zoom-in) |
| `--fs-checkpoint-scale-out` | `1.25` | Scale amount (zoom-out) |

Classes allow deeper customization and indicate the current state of a specific instance.

| Classname | Type | Description |
| -- | -- | -- |
| `.fs-checkpoint` | `element` | Target element |
| `.fs-checkpoint-active` | `modifier` | Indicates active state |

</div>