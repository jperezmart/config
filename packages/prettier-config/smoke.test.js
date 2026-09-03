// Same job as the eslint-config smoke test: prove the two plugins this package
// names are actually resolvable from it, not merely listed.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { isAbsolute } from 'node:path';
import { test } from 'node:test';

import config from './index.js';

const require = createRequire(import.meta.url);
const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

// A subpath that is exported but not in `files` publishes a package whose
// import 404s — invisible until someone installs it.
test('every exported subpath ships and exists', () => {
  const targets = Object.values(pkg.exports);
  assert.ok(targets.length > 0);

  for (const target of targets) {
    const file = target.replace(/^\.\//, '');
    assert.ok(
      pkg.files.includes(file),
      `${target} is exported but not in "files"`,
    );
    assert.ok(
      existsSync(new URL(`./${file}`, import.meta.url)),
      `${target} does not exist`,
    );
  }
});

test('exports a Prettier config object', () => {
  assert.equal(typeof config, 'object');
  assert.equal(config.singleQuote, true);
  assert.equal(config.printWidth, 80);
});

// The failure this guards: bare plugin names are resolved from wherever Prettier
// is *run*, so under pnpm a consumer cannot find plugins that only this package
// depends on. They must be absolute paths, and they must point at real files.
test('its plugins are absolute paths that exist', () => {
  assert.equal(config.plugins.length, 2);

  for (const plugin of config.plugins) {
    assert.ok(
      isAbsolute(plugin),
      `${plugin} should be an absolute path, not a bare name`,
    );
    assert.ok(existsSync(plugin), `${plugin} should exist on disk`);
  }
});

test('it still names the two plugins it means to', () => {
  // Each expected plugin must match a path of its own. A `includes ? a : b`
  // label would call any unexpected third plugin "packagejson" and pass.
  for (const name of [
    'prettier-plugin-sort-json',
    'prettier-plugin-packagejson',
  ]) {
    const matches = config.plugins.filter(p => p === require.resolve(name));
    assert.equal(matches.length, 1, `expected exactly one path for ${name}`);
  }
});
