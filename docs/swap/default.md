---
title: Swap
published: true
visible: true
---

# Swap

Simple element classname swapping.

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
* [Accordion](#demo-accordion)
* [Linked](#demo-linked)

</div>

### Basic {#demo-basic}

Swap classes on a target element.

<figure class="demo js-editor" markdown="1">

```html
<a href="#swap_1" class="handle js-swap"
  data-swap-target="#swap_1"
>
  Handle Element
</a>

<div id="swap_1" class="target">
  Target Element
</div>
```

```js
import { Swap, Utils } from 'formstone';

Utils.ready(() => {
  Swap.construct('.js-swap');
});
```

```css
.handle,
.target {
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  color: var(--color-black);
  display: block;
  margin: 20px 10vw;
  padding: 20px;
  text-align: center;
  text-decoration: none;
  transition: all 0.15s linear;
  min-width: 60%;
}

.handle {
  background: var(--color-blue);
}

.handle.fs-swap-active {
  background: var(--color-yellow);
}

.target {
  background: var(--color-gray-20);
}

.target.fs-swap-active {
  background: var(--color-gray-10);
}

.fs-swap-enabled::after {
  content: ' (Enabled)';
}

.fs-swap-active::after {
  content: ' (Active)';
}
```

</figure>

### Accordion {#demo-accordion}

Swap classes on a group of elements.

<figure class="demo js-editor" markdown="1">

```html
<a href="#swap_1" class="handle js-swap"
  data-swap-target="#swap_1"
  data-swap-group="#group_1"
  data-swap-options='{
  "collapse": true
}'
>
  Handle Element 1
</a>

<div id="swap_1" class="target">
  Target Element 1
</div>

<a href="#swap_2" class="handle js-swap"
  data-swap-target="#swap_2"
  data-swap-group="#group_1"
  data-swap-options='{
  "collapse": true
}'
>
  Handle Element 2
</a>

<div id="swap_2" class="target">
  Target Element 2
</div>

<a href="#swap_3" class="handle js-swap"
  data-swap-target="#swap_3"
  data-swap-group="#group_1"
  data-swap-options='{
  "collapse": true
}'
>
  Handle Element 3
</a>

<div id="swap_3" class="target">
  Target Element 3
</div>
```

```js
import { Swap, Utils } from 'formstone';

Utils.ready(() => {
  Swap.construct('.js-swap');
});
```

```css
.handle,
.target {
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  color: var(--color-black);
  display: block;
  margin: 20px 10vw;
  padding: 20px;
  text-align: center;
  text-decoration: none;
  transition: all 0.15s linear;
  min-width: 60%;
}

.handle {
  background: var(--color-blue);
}

.handle.fs-swap-active {
  background: var(--color-yellow);
}

.target {
  background: var(--color-gray-10);
}

.target.fs-swap-enabled {
  display: none;
}

.target.fs-swap-active {
  display: block;
}

.fs-swap-enabled::after {
  content: ' (Enabled)';
}

.fs-swap-active::after {
  content: ' (Active)';
}
```

</figure>

### Linked {#demo-linked}

Swap classes on a set of elements.

<figure class="demo js-editor" markdown="1">

```html
<a href="#swap_1" class="handle js-swap"
  data-swap-target="#swap_1"
  data-swap-linked="#set_1"
  data-swap-options='{
  "collapse": true
}'
>
  Handle Element
</a>

<a href="#swap_1" class="handle action js-swap"
  data-swap-target="#swap_1"
  data-swap-linked="#set_1"
  data-swap-options='{
  "collapse": true
}'
>
  Handle Element
</a>

<div id="swap_1" class="target">
  Target Element
</div>
```

```js
import { Swap, Utils } from 'formstone';

Utils.ready(() => {
  Swap.construct('.js-swap');
});
```

```css
.handle,
.target {
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  color: var(--color-black);
  display: block;
  margin: 20px 10vw;
  padding: 20px;
  text-align: center;
  text-decoration: none;
  transition: all 0.15s linear;
  min-width: 60%;
}

.handle.action {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1;
  margin: 0;
  min-width: unset;
}

.handle {
  background: var(--color-blue);
}

.handle.fs-swap-active {
  background: var(--color-yellow);
}

.target {
  background: var(--color-gray-20);
}

.target.fs-swap-active {
  background: var(--color-gray-10);
}

.fs-swap-enabled::after {
  content: ' (Enabled)';
}

.fs-swap-active::after {
  content: ' (Active)';
}
```

</figure>


<hr class="divider">

<div class="docs" markdown="1">


## Options {#options}

Set instance options by passing a valid object at initialization, or to the public [`.defaults()`](#method-defaults) method. Custom options for a specific instance can also be set by attaching a `data-swap-options` attribute containing a properly formatted JSON object to the target element.

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `classes` | `object` | `...` | State classes applied by the instance |
| `classes.enabled` | `string` | `'fs-swap-enabled'` | Class applied when instance is enabled |
| `classes.active` | `string` | `'fs-swap-active'` | Class applied when instance is active |
| `classes.inactive` | `string` | `'fs-swap-inactive'` | Class applied when instance is inactive |
| `collapse` | `boolean` | `true` | Allow instance to collapse |
| `maxWidth` | `string | number` | `Infinity` | Maximum viewport width to enable instance |
| `minWidth` | `string` | `'0px'` | Width to auto-enable instance |

Data attributes can be used for instance setup.

| Name | Type | Description |
| -- | -- | -- |
| `data-swap-options` | `string` (JSON) | JSON encoded object containing [instance options](#options) |
| `data-swap-target` | `string` | Selector for element(s) that should share swap state classes |
| `data-swap-group` | `string` | Group key for mutually exclusive swap behavior |
| `data-swap-linked` | `string` | Link key for synchronized swap instances |
| `data-swap-active` | `string` | Marks an instance as active by default when enabled |


<hr class="divider">


## Methods {#methods}

Methods are publicly available to all active instances, unless otherwise stated.

| Name | Description |
| -- | -- |
| [`.activate()`](#method-activate) | Activates instance |
| [`.construct()`](#method-construct) | Initializes Swap on target elements |
| [`.deactivate()`](#method-deactivate) | Deactivates instance |
| [`.defaults()`](#method-defaults) | Sets default options for future initialization |
| [`.destroy()`](#method-destroy) | Removes instance and all related data |
| [`.disable()`](#method-disable) | Disables instance |
| [`.enable()`](#method-enable) | Enables instance |


### .activate() {#method-activate}

Activates instance.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `internal` | `boolean` (optional) | `false` | Internal flag to prevent linked recursion |

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Swap.activate();
```
</figure>


### .construct() {#method-construct}

Initializes Swap on target elements.

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
let targets = Swap.construct('.js-swap');
Swap.construct('.js-swap', { collapse: false });
```
</figure>


### .deactivate() {#method-deactivate}

Deactivates instance.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `internal` | `boolean` (optional) | `false` | Internal flag to prevent linked recursion |

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Swap.deactivate();
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
Swap.defaults({
  collapse: false
});
```
</figure>


### .destroy() {#method-destroy}

Removes instance and all related data.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Swap.destroy();
```
</figure>


### .disable() {#method-disable}

Disables instance.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `internal` | `boolean` (optional) | `false` | Internal flag to prevent linked recursion |

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Swap.disable();
```
</figure>


### .enable() {#method-enable}

Enables instance.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `internal` | `boolean` (optional) | `false` | Internal flag to prevent linked recursion |

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Swap.enable();
```
</figure>


<hr class="divider">


## Events {#events}

Events are triggered on the target instance's element, unless otherwise stated.

| Name | Description |
| -- | -- |
| `swap:activate` | Instance activated |
| `swap:deactivate` | Instance deactivated |
| `swap:enable` | Instance enabled |
| `swap:disable` | Instance disabled |


<hr class="divider">


## Styles {#styles}

Classes allow deeper customization and indicate the current state of a specific instance.

| Classname | Type | Description |
| -- | -- | -- |
| `.fs-swap-enabled` | `modifier` | Indicates enabled state |
| `.fs-swap-active` | `modifier` | Indicates active state |
| `.fs-swap-inactive` | `modifier` | Indicates inactive state |


</div>
