# @jperezmart/eslint-config

Shared ESLint **flat** configs: a Node/TypeScript base and a React variant.

```sh
pnpm add -D @jperezmart/eslint-config eslint typescript
```

`eslint` and `typescript` are peer dependencies — you already have them. Every
plugin the config registers is a real dependency of this package, so there is
nothing else to install.

## Use

```js
// eslint.config.mjs
import base from '@jperezmart/eslint-config/base';

export default base;
```

```js
// or, for a React package
import react from '@jperezmart/eslint-config/react';

export default react;
```

Both are plain flat-config arrays, so extend them by spreading:

```js
import base from '@jperezmart/eslint-config/base';

export default [...base, { rules: { 'no-console': 'off' } }];
```

## Subpaths

| Subpath  | What it adds                                                                             |
| -------- | ---------------------------------------------------------------------------------------- |
| `/base`  | `@eslint/js` + `typescript-eslint` recommended, type-aware, import sorting, Prettier off |
| `/react` | everything in `/base`, plus `react-hooks` rules and browser globals                      |

There is no `/prettier` subpath. It moved to
[`@jperezmart/prettier-config`](https://www.npmjs.com/package/@jperezmart/prettier-config),
with no compatibility alias.

## `tsconfigRootDir`

The base enables typescript-eslint's project service and defaults
`tsconfigRootDir` to **`process.cwd()`** — the directory you run ESLint from.
Override it only if that is not where your `tsconfig.json` lives:

```js
export default [
  ...base,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
];
```

Note this is a change from the copy that used to be vendored inside `nest-casl`
and `nest-mongodb`, which defaulted to `import.meta.dirname`. In a published
package that resolves to somewhere inside your `node_modules`, which is never
what you want.

## Turning off type-aware linting

The base is type-aware, which needs a TypeScript program. For plain JavaScript
files, or a repo with no `tsconfig.json`:

```js
export default [
  ...base,
  {
    languageOptions: { parserOptions: { projectService: false } },
    rules: { '@typescript-eslint/no-unnecessary-condition': 'off' },
  },
];
```

This repo does exactly that in its own `eslint.config.mjs`.

## Two plugins the vendored copy had, and this package does not

Both were dropped on evidence, and both are one line to restore if you disagree.

**`eslint-plugin-turbo`** was registered and never used — no `turbo/*` rule was
ever switched on. It cost every consuming repo a dependency and bought nothing.
Enabling `turbo/no-undeclared-env-vars` was the alternative and was rejected:
turning a rule on in a config five repos are adopting is a behaviour change,
whereas dropping an inert plugin is not.

**`eslint-plugin-import`** was carried for one rule,
`import/no-extraneous-dependencies`. Three findings retired it:

1. `eslint-plugin-import@2.32.0` caps its peer range at ESLint 9 and is broken on
   10 — `context.parserOptions` no longer exists, so its rules read `undefined`.
   `no-default-export` throws; `no-extraneous-dependencies` just stops reporting,
   with no warning of any kind.
2. `eslint-plugin-import-x`, the maintained fork, does support ESLint 10 — but it
   pulls `unrs-resolver`, a native dependency with an install script that every
   consuming repo would have to approve.
3. Neither matters: the rule cannot fire in a pnpm workspace anyway. Under
   pnpm's strict `node_modules` an undeclared import is unresolvable by
   construction, and the rule skips what it cannot resolve.

The smoke tests in this repo guard both classes: one asserts every rule the
config enables actually loads under the installed ESLint, the other that every
plugin registered has at least one rule using it.
