---
title: Background
published: true
visible: true
---

# Background

Full-frame, responsive image and video backgrounds.

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

* [Image](#demo-image)
* [Responsive](#demo-responsive)
* [Video](#demo-video)
* [YouTube](#demo-youtube)

</div>

### Image {#demo-image}

Create a new Background by passing the source image URL at initialization.

<figure class="demo js-editor" markdown="1">

```html
<div class="background js-background"
data-background-options='{
  "source": "//spaceholder.dev/1600x900/1.jpg",
  "alt": "Background Image"
}'>
  <h1>Lorem Ipsum</h1>
</div>
```

```js
import { Background, Utils } from 'formstone';

Utils.ready(() => {
  Background.construct('.js-background');
});
```

```css
.background {
  aspect-ratio: 16/9;
  display: grid;
  align-items: center;
  justify-content: center;
}

.background h1 {
  z-index: 1;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  font-size: 40px;
  line-height: 1;
  padding: 20px 30px;
  text-transform: uppercase;
}
```

</figure>


### Responsive {#demo-responsive}

Create a responsive-friendly Background by defining key/value pairs containing the min-width and image URLs.

<figure class="demo js-editor" markdown="1">

```html
<div class="background js-background"
data-background-options='{
  "source": {
    "0": "//spaceholder.dev/800x450/1.jpg",
    "740": "//spaceholder.dev/1600x900/3.jpg"
  },
  "alt": "Background Image"
}'>
  <h1>Lorem Ipsum</h1>
</div>
```

```js
import { Background, Utils } from 'formstone';

Utils.ready(() => {
  Background.construct('.js-background');
});
```

```css
.background {
  aspect-ratio: 16/9;
  display: grid;
  align-items: center;
  justify-content: center;
}

.background h1 {
  z-index: 1;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  font-size: 40px;
  line-height: 1;
  padding: 20px 30px;
  text-transform: uppercase;
}
```

</figure>


### Video {#demo-video}

Create a video Background by defining proper browser-specific source video URLs, as well as a poster image URL.

<figure class="demo js-editor" markdown="1">

```html
<div class="background js-background"
data-background-options='{
  "source": {
    "webm": "//spaceholder.dev/video/video.webm",
    "mp4": "//spaceholder.dev/video/video.mp4",
    "ogg": "//spaceholder.dev/video/video.ogv",
    "poster": "//spaceholder.dev/video/poster.jpg"
  },
  "alt": "Background Video"
}'>
  <h1>Lorem Ipsum</h1>
</div>
```

```js
import { Background, Utils } from 'formstone';

Utils.ready(() => {
  Background.construct('.js-background');
});
```

```css
.background {
  aspect-ratio: 16/9;
  display: grid;
  align-items: center;
  justify-content: center;
}

.background h1 {
  z-index: 1;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  font-size: 40px;
  line-height: 1;
  padding: 20px 30px;
  text-transform: uppercase;
}
```

</figure>


### YouTube {#demo-youtube}

Create a YouTube Background by defining the `youtube` URL.

<figure class="demo js-editor" markdown="1">

```html
<div class="demo_background js-background"
data-background-options='{
  "source": {
    "youtube": "https://www.youtube.com/watch?v=ScMzIvxBSi4"
  }
}'>
  <h1>Lorem Ipsum</h1>
</div>
```

```js
import { Background, Utils } from 'formstone';

Utils.ready(() => {
  Background.construct('.js-background');
});
```

```css
.demo_background {
  aspect-ratio: 16/9;
  display: grid;
  align-items: center;
  justify-content: center;
}

.demo_background h1 {
  z-index: 1;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  font-size: 40px;
  line-height: 1;
  padding: 20px 30px;
  text-transform: uppercase;
}
```

</figure>


<hr class="divider">

<div class="docs" markdown="1">


## Options {#options}

Set instance options by passing a valid object at initialization, or to the public [`.defaults()`](#method-defaults) method. Custom options for a specific instance can also be set by attaching a `data-background-options` attribute containing a properly formatted JSON object to the target element.

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `alt` | `string` | `''` | Image `alt` attribute |
| `autoPlay` | `boolean` | `true` | Autoplay video |
| `lazy` | `boolean` | `false` | Lazy load media on scroll |
| `lazyOffset` | `string` | `'100px'` | Distance from bottom of window for lazy loading |
| `loop` | `boolean` | `true` | Loop video |
| `mute` | `boolean` | `true` | Mute video |
| `source` | `string | object` | `null` | Source image URL (string or responsive object) or video object |
| `youtubeOptions` | `object` | `{}` | Options passed to YouTube player |

Data attributes provide configuration options and can be set directly on the target element.

| Name | Type | Description |
| -- | -- | -- |
| `data-background-options` | `string` (JSON) | JSON encoded object containing [instance options](#options) |


<hr class="divider">


## Methods {#methods}

Methods are publicly available to all active instances, unless otherwise stated.

| Name | Description |
| -- | -- |
| [`.construct()`](#method-construct) | Initializes Background plugin on target elements |
| [`.defaults()`](#method-defaults) | Sets default options for future Background instances |
| [`.destroy()`](#method-destroy) | Removes plugin and all related data |
| [`.load()`](#method-load) | Loads new source media |
| [`.mute()`](#method-mute) | Mutes current video |
| [`.pause()`](#method-pause) | Pauses current video |
| [`.play()`](#method-play) | Plays current video |
| [`.unmute()`](#method-unmute) | Unmutes current video |


### .construct() {#method-construct}

Initializes Background plugin on target elements.

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
let targets = Background.construct('.js-background');
```
</figure>

<figure class="example js-example" markdown="1">
```js
let targets = Background.construct('.js-background', {
  lazy: true,
  lazyOffset: '10vh'
});
```
</figure>


### .defaults() {#method-defaults}

Sets default options for future Background instances.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `options` | `object` (required) | `{}` | Object containing default [options](#options) |

#### Examples

<figure class="example js-example" markdown="1">
```js
Background.defaults({
  lazy: true,
  lazyOffset: '10vh'
});
```
</figure>


### .destroy() {#method-destroy}

Removes plugin and all related data.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Background.destroy();
```
</figure>


### .load() {#method-load}

Loads new source media.

#### Parameters

| Name | Type | Default | Description |
| -- | -- | -- | -- |
| `source` | `string | object` (required) | `null` | Source image URL (string or responsive object) or video object |

#### Examples

<figure class="example js-example" markdown="1">
```js
// Load single image
el.Background.load('/path/to/image.jpg');
```
</figure>

<figure class="example js-example" markdown="1">
```js
// Load responsive images
el.Background.load({
  0: '/path/to/small-image.jpg',
  740: '/path/to/large-image.jpg'
});
```
</figure>

<figure class="example js-example" markdown="1">
```js
// Load video
el.Background.load({
  mp4: '/path/to/video.mp4',
  webm: '/path/to/video.webm',
  poster: '/path/to/poster.jpg'
});
```
</figure>

<figure class="example js-example" markdown="1">
```js
// Load YouTube video
el.Background.load({
  youtube: 'https://www.youtube.com/watch?v=VIDEO_ID'
});
```
</figure>


### .mute() {#method-mute}

Mutes current video.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Background.mute();
```
</figure>


### .pause() {#method-pause}

Pauses current video.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Background.pause();
```
</figure>


### .play() {#method-play}

Plays current video.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Background.play();
```
</figure>


### .unmute() {#method-unmute}

Unmutes current video.

#### Examples

<figure class="example js-example" markdown="1">
```js
el.Background.unmute();
```
</figure>


<hr class="divider">


## Events {#events}

Events are triggered on the target instance's element, unless otherwise stated.

| Name | Description |
| -- | -- |
| `background:loaded` | Background media loaded |


<hr class="divider">


## Styles {#styles}

CSS custom properties are used to modify default styles.

| Property | Default | Description |
| -- | -- | -- |
| `--fs-background-duration` | `0.15s` | Transition duration |

Classes allow deeper customization and indicate the current state of a specific instance.

| Classname | Type | Description |
| -- | -- | -- |
| `.fs-background` | `element` | Target element |
| `.fs-background-container` | `element` | Media container element |
| `.fs-background-media` | `element` | Media element |
| `.fs-background-image` | `modifier` | Indicates image media |
| `.fs-background-video` | `modifier` | Indicates video media |
| `.fs-background-embed` | `modifier` | Indicates embeded media (YouTube) |
| `.fs-background-loaded` | `modifier` | Indicates media has loaded |
| `.fs-background-lazy` | `modifier` | Indicates lazy loading media |



</div>