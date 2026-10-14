# AGENTS.md

Guidance for anyone, human or AI agent, working on the Formstone codebase.

Formstone is a library of modular front-end components written in dependency-free modern JavaScript, with optional jQuery adaptors. Styles are authored in Less, and CSS/SCSS builds are generated from them. It is published to npm as `formstone` and licensed under GPL-3.0.

---

## Repository layout

| Path | What it is | Edit by hand? |
| --- | --- | --- |
| `src/js/*.js` | **Source.** One ES module per component plus `utils.js`; `index.js` re-exports everything | Yes |
| `src/jquery/*.js` | **Source.** Thin jQuery bridges, one per component; `adaptor.js` holds the shared bridge | Yes |
| `src/less/*.less` | **Source.** Component styles; `index.less` imports them all | Yes |
| `src/css/*.css` | Generated from `src/less` by gulp `convert-css` | **No** |
| `src/scss/*.scss` | Generated from the compiled `src/less` output by gulp `convert-scss`, then checked by `verify-scss` | **No** |
| `dist/` | Generated UMD bundles (`formstone.js`, `formstone.jquery.js`), `formstone.css`, and `package.json` (`{"type": "commonjs"}`, so `require()` treats the UMD bundles as CommonJS) | **No** |
| `docs/<module>/default.md` | Documentation pages, one per module (front-matter + Markdown, rendered by the docs site) | Yes |
| `demo/*.html` | Manual test pages for the four consumption modes (ES bundle, ES browser, jQuery bundle, jQuery browser) | Yes |
| `gulpfile.cjs` | Build pipeline (CommonJS, since the package is `"type": "module"`) | Yes |
| `tasks/gpl.txt` | License template; `license.txt` is generated from it | Template only |
| `tasks/css.cjs` | CSS build helpers: Lightning CSS prefixing/minifying for `dist/formstone.css`, empty-line cleanup for `src/css` | Yes |
| `tasks/js.cjs` | webpack UMD bundling for `dist/formstone.js` and `dist/formstone.jquery.js` | Yes |
| `tasks/scss.cjs` | SCSS generation and verification used by the gulp `convert-scss` / `verify-scss` tasks | Yes |
| `.browserslistrc` | Browser targets for CSS prefixes (Lightning CSS) and webpack's output syntax | Yes |
| `test/` | Tests: `browser/*.spec.js` (Playwright), `node/*.test.js` (`node:test`), `fixtures/*.html` (pages the browser specs load), `server.js` (static server for fixtures) | Yes |
| `playwright.config.js` | Playwright config: Chromium, runs `test/server.js` on port 8765 | Yes |
| `.github/workflows/test.yml` | CI: production build, build-output check, `npm test` | Yes |
| `CHANGELOG.md` | Release notes, newest first | Yes |

Components: `Background`, `CheckPoint`, `Cookie`, `Lightbox`, `MediaQuery`, `Modal`, `Navigation`, `Swap`, `Tabs`, plus the `Utils` namespace.

Components depend on one another: `Tabs` and `Navigation` are built on `Swap`, and `Swap`, `Tabs`, `Background` and others use `MediaQuery`. When you change a shared component, check every consumer:

```sh
grep -l "from './swap.js'" src/js/*.js
```

## Build

Requires Node ≥20.19 (`engines` in `package.json`; `.nvmrc` pins 24). The toolchain is gulp 5, webpack 5 (through its Node API, `tasks/js.cjs`), `less`, Lightning CSS (`tasks/css.cjs`) and `sass` (for `verify-scss`).

```sh
npm run gulp         # development build: beautify, bundle, convert Less → CSS/SCSS, regenerate license
npm run gulp-build   # production build (NODE_ENV=production); runs automatically on `npm publish` (prepublishOnly)
npx gulp dev         # build, then watch Less/JS
```

Notes:
- The build **rewrites source files in place**: `beautify-scripts` reformats `src/js` and `src/jquery`, and `beautify-styles` reformats `src/less`. Expect formatting-only diffs after a build.
- `clean` deletes `dist/*`, `src/css/*` and `src/scss/*` before regenerating them.
- `dist/formstone.css` is prefixed and minified by Lightning CSS using `.browserslistrc`. Keep that file in line with what the JS actually supports (private class members, `<dialog>`, `inert`); targeting browsers that can't run the JS only adds dead prefixes.
- Generated file banners include the version from `package.json` and the build date, so every build touches every generated file.
- Release with `gulp-build` only. Development bundles contain `eval()` and will not run under a strict CSP. `prepublishOnly` enforces this for `npm publish`, and plain `npx gulp` (no `NODE_ENV`) also builds production; commit `dist/` from a production build.
- `beautify-*` strips the final newline from some files, so a build may show newline-only diffs.
- Run `npm test` before committing (see **Testing**).

## Testing

```sh
npm test               # node tests, then browser tests
npm run test:node      # node --test "test/node/*.test.js"
npm run test:browser   # playwright test (starts test/server.js)
npx playwright test --ui   # debug browser tests
```

- **Browser tests (Playwright, Chromium)** load fixture pages from `test/fixtures/`, which import `src/` (or `dist/` for `dist-smoke.html`). Use a real browser: transitions, `<dialog>`, `inert`, focus, pointer capture, `matchMedia` and IntersectionObserver are where bugs live, and simulated DOMs don't implement them faithfully.
- **Fixtures report results** in one of three ways (helpers in `test/browser/helpers.js`):
  - `window.R`, a JSON string, read with `result()`;
  - an `#out` element, read with `out()`;
  - `window.T` phases `setup()` / `wide()` / `narrow()` run at 500 → 1000 → 500px, with `phases()`.

  Specs that need real input use `ready()` plus `page.mouse` / `page.keyboard` / `touchDrag()`.
- **Docs demos:** `test/fixtures/docs-demo.html?page=<page>&demo=<n>` runs a docs demo the way the CodePen embeds do (`formstone` import-mapped to `src/js/index.js`, `dist/formstone.css`, the demo's fences as style, body and module script). `docs-demos.spec.js` runs every demo in `docs/*/default.md`, fails on JS errors, and runs the interaction checks keyed by `page › title`. Headless browsers can't render CodePen's result frame, so check the live embeds by hand.
- **Requests outside localhost are blocked** (`offline()`), so tests never depend on the network. Fake external APIs (see the `YT` stub in the Background fixtures) instead of loading them.
- **Node tests** cover packaging, from a throwaway consumer project linked to the repo:
  - every `exports` path resolves;
  - `import` works without a window or warnings;
  - `require()` gets the UMD build;
  - Sass `pkg:formstone` works.

  They also cover DOM-free helpers in `utils.js`.
- **Name tests after the finding or behavior they protect** (e.g. `H7: …`) so failures trace back to the audit in `feedback.md`. When fixing a bug, add or extend a fixture and spec, and check the spec fails without the fix.
- **CI** (`.github/workflows/test.yml`) runs the production build (including `verify-scss`) and fails if committed `dist/`, `src/css` or `src/scss` differ from a fresh build (banner lines aside), then runs `npm test`. Commit build output from `npm run gulp-build`.
- Autoplay and other browser policies differ between browsers and headless modes. Make fixtures deterministic (e.g. stub `HTMLMediaElement.prototype.play`) rather than relying on a policy.

## Package entry points

`package.json` `exports` maps:
- `formstone` → `src/js/index.js` (ESM) or `dist/formstone.js` (CJS `require`)
- `formstone/<module>` → `src/js/<module>.js`
- `formstone/jquery` and `formstone/jquery/<module>` → `src/jquery/…`
- `formstone/<name>.css|.less|.scss` → `src/css|less|scss/<name>.*`, including `index.*` for all components
- `formstone/dist/*` → `dist/*`, and `formstone/package.json`
- Sass: the `sass` condition on `"."` points at `src/scss/index.scss`, so `@use 'pkg:formstone' with (…)` works with Sass's `NodePackageImporter`. Single modules must include the extension (`pkg:formstone/lightbox.scss`), because `lightbox` alone matches both the `.scss` and `.css` patterns.

The package is `"type": "module"`: every `.js` file is ESM. Build scripts are `.cjs`, and the `dist-scope` build step writes `dist/package.json` to keep the UMD bundles CommonJS. Don't add CommonJS `.js` files outside `dist/`.

Consumers import `src/` directly, so **everything in `src/js` ships as-is**. Do not introduce syntax or APIs that need a transpile step beyond what `.browserslistrc` supports (`defaults, not op_mini all`).

There is no `sideEffects` field; it was removed in 2.2.2 because the jQuery adaptors, the CSS and `background.js` have import-time side effects. If you reintroduce it, use an explicit list of side-effect files, not `false`.

---

## Anatomy of a component

Every widget component follows the same shape. Use `src/js/swap.js` as the reference implementation.

```js
/**
 * @fileoverview Name - One-line description
 */

import { extend, select, iterate, on, off, trigger } from './utils.js';

/**
 * Name class for …
 * @class
 */
class Name {

  /** @type {number} @private */
  static #_guid = 1;

  /**
   * @typedef {Object} NameOptions
   * @property {boolean} [option=true] - Description
   */

  /** @type {NameOptions} @private */
  static #_defaults = { /* … */ };

  static defaults(options) {
    this.#_defaults = extend(true, this.#_defaults, options);
  }

  static construct(selector, options) {
    let targets = select(selector);

    iterate(targets, (el) => {
      if (!el.Name) {
        new Name(el, options);
      }
    });

    return targets;
  }

  //

  constructor(el, options) {
    if (el.Name) {
      console.warn('Name: Instance already exists', el);
      return;
    }

    // Parse JSON Options

    let optionsData = {};
    let dataset = el.dataset;

    try {
      optionsData = JSON.parse(dataset.nameOptions || '{}');
    } catch (e) {
      console.warn('Name: Error parsing options JSON', el);
    }

    // Internal Data

    Object.assign(this, extend(true, this.constructor.#_defaults, options || {}, optionsData));

    this.el = el;
    this.guid = this.constructor.#_guid++;
    this.guidClass = `fs-name-element-${this.guid}`;

    // … setup, listeners

    el.Name = this;
  }

  destroy() {
    // undo everything the constructor and enable() did

    this.el.Name = null;

    delete this.el.Name;
  }

  //

  // public methods (enable/disable/open/close/activate/…)

  //

  #onClick(e) {
    let instance = this.Name; // `this` is the element the listener is bound to
    // …
  }

};

// Export

export default Name;
```

### Conventions

- **Instance storage:** the instance lives on the element as `el.<ClassName>` (e.g. `el.Swap`, `el.Tabs`). Public API calls go through it: `el.Tabs.activate()`.
- **Options are merged in this order:** static defaults, then constructor `options`, then `data-<name>-options` JSON. The merged options are assigned directly onto the instance with `Object.assign(this, …)`.
  - ⚠️ Because of this, **an option name must never match a method name**: the option becomes an own property that shadows the method. Background's `mute` option is the one legacy exception; its constructor moves it to `this.muted` and deletes `this.mute`. Don't add more.
- **Per-element configuration** comes from `data-<name>-*` attributes, read via `el.dataset`.
- **Identity:** `static #_guid` gives each instance a number, which is used for `fs-<name>-element-<guid>` classes and MediaQuery binding keys.
- **Private members:** use `#` private fields and methods. Statics use the `#_name` prefix.
- **Event handlers** are private methods named `#on<Event>` (`#onClick`, `#onKeyDown`). Handlers attached to an element read the instance via `this.<ClassName>`, because `this` is the element. Private methods are stable references, so `off()` works with them. **Never pass an inline arrow or `.bind()` result to `on()` unless you store it for `off()`.**
- **Events:**
  - Custom events are namespaced `name:action` (`swap:activate`, `tabs:enable`) and dispatched with `trigger(el, 'name:action', detail)`.
  - Widgets dispatch on their element. Modal and Lightbox currently dispatch on `window`, which is a known inconsistency; don't copy it.
- **CSS classes:**
  - All generated classes are prefixed `fs-<name>-`. State modifiers are `fs-<name>-enabled`, `-active`, `-open`, `-loaded`, etc.
  - `fs-` classes are owned by the library: components add and remove them, and they are **never** required in (or documented for) consumer markup. Consumers select elements with their own classes (`js-…`) and `data-*` attributes. Styles must not hide or transform content unless a component-added `fs-` class is present, so content is visible without JS and after `destroy()`.
  - Class names that consumers might restyle go in the `classes` option object.
- **Responsive behavior** goes through `MediaQuery.bind(key, query, { enter, leave })`. Any binding created in the constructor **must** be released with `MediaQuery.unbind(key)` in `destroy()`.
- **Section separators:** a bare `//` line separates groups (statics, lifecycle, public methods, private handlers). Short labeled comments such as `// Parse JSON Options` and `// Internal Data` introduce steps inside long methods.

### Utilities

Use `src/js/utils.js` helpers instead of raw DOM APIs, for consistency and NodeList handling:

- `select`, `iterate`, `iterable`, `element`, `siblings`
- `on`, `once`, `off`, `trigger`
- `addClass`, `removeClass`, `hasClass`
- `getAttr`, `setAttr`, `removeAttr`, `hasAttr`, `updateAttr`, `restoreAttr`
- `prepend`, `append`, `before`, `after`
- `extend`, `isFn`, `isObj`, `isU`, `falsey`, `ready`, `camelCase`

Most helpers accept a single element, a NodeList or an Array.

Known utils gotchas until they are fixed:
- `isObj(null)` returns `true`.
- `extend(true, …)` only merges one level deep.
- `off()` ignores listener options, so capture listeners can't be removed through it.

### jQuery adaptors

Each `src/jquery/<module>.js` imports the core class and registers it through `adaptor.js`:
- `widget(Class, 'Name')` adds `$.fn.name(options | 'method', …args)`.
- `utility(Class, 'Name')` adds `$.name('staticMethod', …args)`.
- Registrations are applied to a global `jQuery` when one exists at import time, and are also recorded so that `install($)` (exported from `formstone/jquery`) can apply them to a jQuery that isn't global, e.g. one imported in a bundler.
- `$(el).name('method', …args)` returns the first element's result when it isn't `undefined` (e.g. the Promise from `close()`), and otherwise the jQuery collection for chaining.

Adaptors must stay thin. All behavior belongs in `src/js`. When you add a component, add its adaptor and export it from both `src/js/index.js` and `src/jquery/index.js`.

---

## JavaScript style

- 2-space indentation, LF line endings, UTF-8, trailing newline, no trailing whitespace (see `.editorconfig`). `gulp-beautify` enforces formatting at build time.
- Single quotes; template literals for interpolation. Semicolons always.
- `let` by default; `const` is fine for true constants. Never `var`.
- Arrow functions for callbacks. `for…of` or `iterate()`, not `for…in`, over arrays and NodeLists. In a module you edit, prefer `iterate()` for consistency.
- Use early returns for guard clauses (`if (this.enabled) { return; }`). Always use braces.
- Named imports from `./utils.js` in a multi-line block, grouped by purpose with `//` separators.
- Each module ends with `// Export` followed by `export default ClassName;`.
- JSDoc on every class, public method, static method and options typedef, with `@param`, `@returns` and an `@example` showing `el.Name.method()` usage. Private handlers get a short JSDoc with `@private`.
- Never leave `console.log` in. `console.warn('Name: message', el)` is the pattern for recoverable misuse.
- Don't add new commented-out code or TODOs; remove stale ones when you touch the surrounding code.

## Less / CSS style

- Author styles in `src/less/<module>.less` only. Add new modules to `src/less/index.less`.
- File header: a `/** @module name @description … */` doc block.
- **Theming:**
  - Every tunable value is a Less variable `@fs-<name>-<property>` with a `/** … @type … @default … */` doc block.
  - Each Less variable is exposed as a CSS custom property `--fs-<name>-<property>: @fs-<name>-<property>;` on the root selector.
  - Rules consume the custom property (`var(--fs-…)`), never the Less variable directly.
- **Selectors:**
  - Nest from the root class: `.fs-name { &-element&-state { … } }`.
  - Document compound selectors with `@selector` and `@modifier` comments.
  - Don't leave empty rulesets.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` sets duration custom properties to `0s`. See the transition rule below; JavaScript must not depend on `transitionend` firing.
- **SCSS is generated from the compiled CSS, not by translating Less syntax** (`tasks/scss.cjs`). `convert-scss` compiles each Less file, emits one `$fs-*: <evaluated value> !default;` per Less variable, and points the custom property (or `@media` query) that used it at the Sass variable. `verify-scss` then fails the build unless:
  - each SCSS file, and `index.scss`, compiles to the same CSS as its Less source;
  - every used variable can be configured with `@use … with ()`, both directly and through the index;
  - compiling produces no Sass warnings, deprecations included. Follow the Sass module system: `index.scss` uses `@forward`, never `@import`.
- **Supported uses of Less variables:** the variable declaration, the root custom-property declaration and `@media` preludes. Anything else (selectors, other properties, mixins) makes `convert-scss` throw. Keep to the custom-property pattern above, and use Less functions freely, since SCSS gets lessc's evaluated values.

## Documentation

- `docs/<module>/default.md` has YAML front-matter (`title`, `published`, `visible`), a `docs_menu` table of contents, then **Demos**, **Options**, **Methods**, **Events** and **Styles** sections.
- Demos are `<figure class="demo js-editor" markdown="1">` blocks containing `html`, `js` and `css` fences. The docs site (formstone-grav) turns each into a CodePen embed, so demos must be self-contained:
  - **JS** imports from `'formstone'` (import-mapped to jsDelivr's `src/js/index.js`, pinned to the version the site's `bin/formstone` submodule reports), and wraps setup in `Utils.ready(…)`. A demo can only use features in that published version.
  - **CSS:** the embed loads the theme's `demo.css`, which only provides base styles and variables (`--color-*`, `--border-size`), plus `dist/formstone.css`. Each demo styles its own markup (`.demo_*` classes).
  - **Media** must be hosted (spaceholder.dev images, YouTube/Vimeo).
  - Off-canvas Navigation demos set `maxWidth: Infinity` so they work at any embed width.
  - Every demo runs in `test/browser/docs-demos.spec.js` (see **Testing**); add an interaction check there for new demos.
- Any change to options, methods, events, data attributes or generated classes must update the docs page in the same change. Docs must match the code exactly: default values, return types, and what dispatches on which target.

## Changelog and versioning

- Semantic versioning. Bump `version` in `package.json`, then add a `### x.y.z` section at the top of `CHANGELOG.md` with short bullet points in past or present tense ("Fixed issue with …", "Added …").
- Run `npm run gulp-build` after bumping, so the banners and `dist/` carry the new version.

---

## Engineering standards (required for new and changed code)

These rules come from the 2026-10 audit (see `feedback.md`). Existing code doesn't meet all of them yet; any code you touch must.

1. **`destroy()` is a full inverse of construction.** It removes every listener (including keyboard and Space handlers), unbinds every `MediaQuery` key, disconnects observers, clears timers, and removes added classes, attributes, ids and DOM. After `destroy()` and a window resize, nothing may run.
2. **Never rely on `transitionend` alone.** Durations can be `0s` (reduced motion) or the element can be hidden, so the event may never fire, and `transitionend` bubbles from children with their own transitions. Use `afterTransition(el, cb)` from `utils.js`: it runs immediately when there's no transition, only counts the element's own transition, and falls back to a timeout.
3. **No user-controlled content in HTML strings.** Content from attributes, `title`, captions or URLs goes in through `textContent` or `setAttr`, never `innerHTML` or `insertAdjacentHTML` templates.
4. **Escape values in selectors.** Wrap hashes, ids and data-attribute values in `CSS.escape()` before using them in a selector, and quote attribute selectors.
5. **Validate URLs** that become `src` or `href`. Allow only `http:`, `https:` and relative URLs; never `javascript:`.
6. **Guard required elements.** If a required `data-*` target or element is missing, `console.warn` and bail out instead of throwing later.
7. **SSR-safe at import time.** Don't touch `window`, `document` or `navigator` at module top level; read them lazily inside methods.
8. **Accessibility:**
   - Interactive patterns follow WAI-ARIA Authoring Practices: tabs use roving `tabindex` and arrow, Home and End keys; disclosures keep `aria-expanded` accurate in every state; dialogs trap focus, restore focus on close and make the background inert.
   - Save original attribute values per instance, not under a shared key.
   - Respect `prefers-reduced-motion`.
9. **Multiple instances must not interfere.** Scope all queries to the instance (container, group or guid class), never page-wide `select('.fs-…')[0]`.
10. **Numeric options** that end up in CSS or media queries get units (`px`) appended when given as numbers.
