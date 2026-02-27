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

</div>

### Basic {#demo-basic}

Swap classes on a target element.

<figure class="demo js-editor" markdown="1">

```html
<!-- Demo coming soon -->
```

```js
import { Swap, Utils } from 'Formstone';

Utils.ready(() => {
  // Demo coming soon
});
```

```css
/* Demo coming soon */
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
