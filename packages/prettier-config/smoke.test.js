// Same job as the eslint-config smoke test: prove the two plugins this package
// names are actually resolvable from it, not merely listed.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { isAbsolute } from 'node:path';
import { test } from 'node:test';

import config from './index.js';

const require = createRequire(import.meta.url);

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
  const named = config.plugins.map(p =>
    p.includes('sort-json') ? 'sort-json' : 'packagejson',
  );
  assert.deepEqual(named.sort(), ['packagejson', 'sort-json']);
  assert.ok(require.resolve('prettier-plugin-sort-json'));
  assert.ok(require.resolve('prettier-plugin-packagejson'));
});
