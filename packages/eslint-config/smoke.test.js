// The defect this guards against is the one the vendored copy shipped with: a
// config whose plugins are not installed alongside it. Importing both entry
// points resolves the whole plugin graph, so a missing dependency fails here
// rather than in a consumer's repo after publish.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { Linter } from 'eslint';

import base from './base.js';
import react from './react.js';

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

test('base is a non-empty flat config array', () => {
  assert.ok(Array.isArray(base));
  assert.ok(base.length > 0);
});

test('react extends base rather than replacing it', () => {
  assert.ok(Array.isArray(react));
  // Length alone would pass even if react had thrown base's blocks away and
  // added more of its own, so check base's blocks are actually still there.
  assert.deepEqual(react.slice(0, base.length), base);
  assert.ok(react.length > base.length);
});

test('base does not pin tsconfigRootDir inside this package', () => {
  // Once published, `import.meta.dirname` would point into the consumer's
  // node_modules. The default must track where ESLint is invoked from.
  const withParser = base.find(
    c => c.languageOptions?.parserOptions?.projectService,
  );
  assert.ok(withParser, 'expected a block enabling the project service');
  assert.equal(
    withParser.languageOptions.parserOptions.tsconfigRootDir,
    process.cwd(),
  );
});

test('react adds the react-hooks plugin', () => {
  const hooks = react.find(c => c.plugins && 'react-hooks' in c.plugins);
  assert.ok(hooks, 'expected a block registering react-hooks');
});

// Regression guard, and the reason this file exists. A plugin can be installed,
// import cleanly, and still be broken against the running ESLint: that is
// exactly what `eslint-plugin-import` did on ESLint 10, where it read a removed
// API as `undefined` and one rule stopped reporting while another threw. So
// actually *run* every rule this config turns on, over a trivial source file,
// and assert ESLint neither crashes nor reports a rule as unknown.
test('every rule this config enables loads under the installed ESLint', () => {
  const linter = new Linter();
  const messages = linter.verify(
    'export const answer = 42;\n',
    // The type-aware half needs a real TypeScript program, which a synthetic
    // probe has no way to join — so drop it, exactly as this repo's own
    // eslint.config.mjs does. Every other plugin and rule still loads and runs,
    // which is what this test is for. `pnpm lint` covers the type-aware half
    // against real sources.
    [
      ...base,
      {
        languageOptions: { parserOptions: { projectService: false } },
        rules: { '@typescript-eslint/no-unnecessary-condition': 'off' },
      },
    ],
    { filename: new URL('./probe.ts', import.meta.url).pathname },
  );

  const broken = messages.filter(m => m.fatal || m.ruleId === null);
  assert.deepEqual(
    broken,
    [],
    `ESLint failed while running the config: ${JSON.stringify(broken)}`,
  );
});

test('the config enables at least one rule from each plugin it registers', () => {
  const plugins = base.flatMap(c => Object.keys(c.plugins ?? {}));
  const rules = base.flatMap(c => Object.keys(c.rules ?? {}));

  for (const plugin of plugins) {
    assert.ok(
      rules.some(r => r.startsWith(`${plugin}/`)),
      `${plugin} is registered but no rule uses it — drop the plugin or use it`,
    );
  }
});
