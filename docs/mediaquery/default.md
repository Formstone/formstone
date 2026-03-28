---
title: MediaQuery
published: true
visible: true
---

# MediaQuery

Responsive media query events.

<div class="docs_menu" markdown="1">

* [Demos](#demo)
* [Methods](#methods)

</div>


<hr class="divider">


## Demos {#demo}

Demos coming soon.

<!-- <div class="docs_menu" markdown="1">

* [Basic](#demo-basic)

</div>

### Basic {#demo-basic}

Bind to media query changes.

<figure class="demo js-editor" markdown="1">

```html
<!-- Demo coming soon -- >
```

```js
import { MediaQuery, Utils } from 'Formstone';

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


## Methods {#methods}

Methods are publicly available static methods.

| Name | Description |
| -- | -- |
| [`.bind()`](#method-bind) | Binds callbacks to a media query |
| [`.unbind()`](#method-unbind) | Unbinds callbacks from a media query |


### .bind() {#method-bind}

Binds callbacks to a media query.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `key` | `string` (required) | `''` | Unique identifier for this binding |
| `media` | `string` (required) | `''` | Media query string (e.g., '(min-width: 768px)') |
| `data` | `object` (required) | `{}` | Object containing `enter` and/or `leave` callback functions |

#### Examples

<figure class="example js-example" markdown="1">
```js
MediaQuery.bind('mobile', '(max-width: 740px)', {
  enter: function() {
    console.log('Mobile view');
  },
  leave: function() {
    console.log('Desktop view');
  }
});
```
</figure>


### .unbind() {#method-unbind}

Unbinds callbacks from a media query.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `key` | `string` (required) | `''` | Unique identifier for the binding to remove |
| `media` | `string` (optional) | `''` | Specific media query string (omit to unbind from all) |

#### Examples

<figure class="example js-example" markdown="1">
```js
MediaQuery.unbind('mobile');
```
</figure>

<figure class="example js-example" markdown="1">
```js
MediaQuery.unbind('mobile', '(max-width: 740px)');
```
</figure>


</div>
