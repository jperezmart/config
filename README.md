# config

The shared configuration the `jperezmart` JS packages consume from npm, instead
of vendoring a copy each.

| Package                                                       | Surface                                 |
| ------------------------------------------------------------- | --------------------------------------- |
| [`@jperezmart/eslint-config`](packages/eslint-config)         | `/base`, `/react`                       |
| [`@jperezmart/typescript-config`](packages/typescript-config) | `base.json`, `nestjs.json`, `vite.json` |
| [`@jperezmart/prettier-config`](packages/prettier-config)     | default export                          |

Three packages, one per concern, **versioned independently**. Install only the
ones you want: the standard is about publishing, not about linting, so consuming
any of these is optional by design. Granularity is the opt-in — npm dependencies
cannot be made optional per subpath, which is why this is not one package with
three subpaths.

## Relationship to `package-template`

[`jperezmart/package-template`](https://github.com/jperezmart/package-template)
is the skeleton; this repo is the scaffolding it points at. The split is worth
stating plainly, because the two repos are easy to confuse:

- **The template's canon is copied.** `release.yml` and `.changeset/config.json`
  physically exist in every repo, because npm binds a trusted publisher to a
  workflow filename in the publishing repository. There is no alternative.
- **This repo's contents are installed.** ESLint, TypeScript and Prettier
  configuration is a normal dependency, so it is inherited, not copied.

This repo is also the **first adopter** of that canon. It copies `release.yml`
verbatim — minus hole 1, the build step, which it has no use for — and satisfies
the template's contract like any other repo. Read
[the template's README](https://github.com/jperezmart/package-template#the-contract)
for what that contract is; it is not repeated here.

There is deliberately **no composite action** in `.github/`, unlike
`TanStack/config` which this repo otherwise follows. A composite action would
work, but it makes `release.yml` resolve a remote repo at run time — a single
point of failure for five repos' releases, sitting in the file nobody touches.

## Consuming these

Each repo already centralises versions in a pnpm catalog, so the ranges go there
and the packages reference `catalog:`:

```yaml
# pnpm-workspace.yaml
catalog:
  '@jperezmart/eslint-config': ^1.0.0
  '@jperezmart/typescript-config': ^1.0.0
  '@jperezmart/prettier-config': ^1.0.0
```

**Caret, and first published at `1.0.0`.** A `0.x` start would have made every
minor a manual bump in five repos, because `^0.1.0` does not admit `0.2.0`.

## Development

```sh
pnpm install
pnpm lint         # this repo lints itself with the config it publishes
pnpm format:check
pnpm test         # smoke tests: every config loads and its plugins resolve
```

Nothing is built. The packages ship the files in the repo as they are, which is
why `release.yml` here has no build step.

The smoke tests exist for one specific failure: a config that lists plugins it
does not actually depend on. That is what the vendored copies shipped with — 13
plugins declared as `devDependencies`, which a consumer never installs — and it
is invisible until someone installs the published package. Importing every entry
point resolves the whole plugin graph, so it fails here instead.

## Adding a fourth package

It is a day-zero package, so it needs the bootstrap in
[the template's README](https://github.com/jperezmart/package-template#day-zero-a-package-that-has-never-been-published)
**at scaffolding time**, not just before its first release: publish a `0.0.0`
placeholder under `--tag bootstrap`, configure the trusted publisher, verify one
OIDC publish, then tighten Publishing access to _disallow tokens_ and revoke the
bootstrap token. The last two are what close day zero.
