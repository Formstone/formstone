---
title: Tabs
published: true
visible: true
---

# Tabs

Simple, mobile-friendly tabs.

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

Create a set of tabs using links.

<figure class="demo js-editor" markdown="1">

```html
<nav class="tabs_menu">
  <a href="#tab-1" class="tabs_link js-tabs"
    data-tabs-group="tabs"
    data-tabs-active="true"
  >
    Tab One
  </a>
  <a href="#tab-2" class="tabs_link js-tabs"
    data-tabs-group="tabs"
  >
    Tab Two
  </a>
  <a href="#tab-3" class="tabs_link js-tabs"
    data-tabs-group="tabs"
  >
    Tab Three
  </a>
</nav>
<div class="tabs_item" id="tab-1">
  Target One
</div>
<div class="tabs_item" id="tab-2">
  Target Two
</div>
<div class="tabs_item" id="tab-3">
  Target Three
</div>
```

```js
import { Tabs, Utils } from 'formstone';

Utils.ready(() => {
  Tabs.construct('.js-tabs', {
    mobileMaxWidth: '500px',
  });
});
```

```css
body {
  padding: 10vh;
}

.tabs_menu {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.tabs_link,
.fs-tabs-tab_mobile {
  background: var(--color-blue);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  color: var(--color-black);
  line-height: 1;
  padding: 10px 15px;
  text-decoration: none;
}

.fs-tabs-tab_mobile {
  width: 100%;
  margin-bottom: 10px;
}

.tabs_item {
  margin: 10px 0;
}

.tabs_link.fs-tabs-active,
.fs-tabs-tab_mobile.fs-tabs-active {
  background: var(--color-yellow);
}

.tabs_item {
  background: var(--color-gray-5);
  border: var(--border-size) solid var(--color-black);
  border-radius: var(--border-size);
  padding: 20px;
}
```

</figure>

<!-- LOCAL STYLES -->

<style>
  .demo playground-preview {
    height: 360px;
  }

  @media (min-width: 550px) {

    .demo playground-preview {
      height: 260px;
    }
  }

  .demo.fs-swap-active playground-preview {
    aspect-ratio: unset;
    height: 70vh;
  }
</style>


<hr class="divider">

<div class="docs" markdown="1">


## Options {#options}

Set instance options by passing a valid object at initialization, or to the public [`.defaults()`](#method-defaults) method. Custom options for a specific instance can also be set by attaching a `data-tabs-options` attribute containing a properly formatted JSON object to the target element.

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `maxWidth` | `string | number` | `Infinity` | Maximum viewport width to enable tabs |
| `mobileMaxWidth` | `string | number` | `'740px'` | Maximum viewport width for mobile tab mode |
| `automatic` | `boolean` | `true` | Automatically activate focused tabs with keyboard navigation |
| `label` | `string` | `'Tabs'` | Accessibility label for the tablist |

Data attributes provide configuration options and can be set directly on the target element.

| Name | Type | Description |
| -- | -- | -- |
| `data-tabs-options` | `string` (JSON) | JSON encoded object containing [instance options](#options) |
| `data-tabs-container` | `string` | Selector for tablist container element |
| `data-tabs-group` | `string` | Group key for related tab links |
| `data-tabs-active` | `string` | Marks a tab as active on initialization |


<hr class="divider">


## Methods {#methods}

Methods are publicly available to all active instances, unless otherwise stated.

| Name | Description |
| -- | -- |
| [`.activate()`](#method-activate) | Activates instance |
| [`.construct()`](#method-construct) | Initializes Tabs on target elements |
| [`.deactivate()`](#method-deactivate) | Deactivates instance |
| [`.defaults()`](#method-defaults) | Sets default options for future initialization |
| [`.destroy()`](#method-destroy) | Removes instance and all related data |
| [`.disable()`](#method-disable) | Disables instance |
| [`.enable()`](#method-enable) | Enables instance |


### .activate() {#method-activate}

Activates instance.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Tabs.activate();
```
</figure>


### .construct() {#method-construct}

Initializes Tabs on target elements.

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
let targets = Tabs.construct('.js-tabs');
Tabs.construct('.js-tabs', { automatic: false });
```
</figure>

<figure class="example js-example" markdown="1">
```js
let targets = Tabs.construct('.js-tabs', {
  mobileMaxWidth: '500px'
});
```
</figure>


### .deactivate() {#method-deactivate}

Deactivates instance.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Tabs.deactivate();
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
Tabs.defaults({
  automatic: false,
  mobileMaxWidth: '500px'
});
```
</figure>


### .destroy() {#method-destroy}

Removes instance and all related data.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Tabs.destroy();
```
</figure>


### .disable() {#method-disable}

Disables instance.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Tabs.disable();
```
</figure>


### .enable() {#method-enable}

Enables instance.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Tabs.enable();
```
</figure>


<hr class="divider">


## Events {#events}

Events are triggered on the target instance's element, unless otherwise stated.

| Name | Description |
| -- | -- |
| `tabs:activate` | Tab activated |
| `tabs:deactivate` | Tab deactivated |
| `tabs:disable` | Tab disabled |
| `tabs:enable` | Tab enabled |


<hr class="divider">


## Styles {#styles}

<!-- CSS custom properties are used to modify default styles.

| Property | Default | Description |
| -- | -- | -- |
| `--fs-background-duration` | `0.15s` | Transition duration | -->

Classes allow deeper customization and indicate the current state of a specific instance.

| Classname | Type | Description |
| -- | -- | -- |
| `.fs-tabs-tab` | `element` | Target element |
| `.fs-tabs-tab_mobile` | `element` | Mobile tab element |
| `.fs-tabs-content` | `element` | Content element |
| `.fs-tabs-container` | `element` | Tab container element |
| `.fs-tabs-enabled` | `modifier` | Indicates enabled state |
| `.fs-tabs-active` | `modifier` | Indicates active state |
| `.fs-tabs-inactive` | `modifier` | Indicates inactive state |
| `.fs-tabs-mobile` | `modifier` | Indicates mobile tab mode |


</div>