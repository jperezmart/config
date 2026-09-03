# @jperezmart/typescript-config

Shared `tsconfig` bases: a strict default, plus NestJS and Vite variants.

```sh
pnpm add -D @jperezmart/typescript-config typescript
```

## Use

```json
// tsconfig.json
{
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "extends": "@jperezmart/typescript-config/base.json",
  "include": ["src"]
}
```

## Variants

| File          | On top of the base                                                       |
| ------------- | ------------------------------------------------------------------------ |
| `base.json`   | strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, ES2022 |
| `nestjs.json` | decorators, `emitDecoratorMetadata`, `node` + `reflect-metadata` types   |
| `vite.json`   | `react-jsx`, DOM libs, `noEmit`, `vite/client` types                     |

Each variant `extends` the base, so extending a variant gets you both.

## Why the `typescript` peer range is wide

`>=5.5.0`, not the `^6.0.3` that `nest-casl`'s catalog pins. A catalog entry says
which TypeScript _that repo_ develops on; a peer range says which ones this
config is safe with, and these are plain compiler options with no version-6
syntax in them. Narrowing it to `^6` would lock out any consumer still on 5 for
no benefit. The same reasoning applies to `@jperezmart/eslint-config`.

Note the base sets `noEmit: false` implicitly (it does not set `noEmit` at all)
and declares `declaration` + `declarationMap` — it is written for packages that
build. `vite.json` flips `noEmit` on, because Vite does the emitting.
