// The tsconfigs ship no code, so the thing worth checking is that the two
// variants still point at the base after any edit, and that `files` and
// `exports` agree — a mismatch publishes a package whose subpath 404s.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = name =>
  JSON.parse(readFileSync(new URL(`./${name}`, import.meta.url), 'utf8'));

const pkg = read('package.json');

test('every published file is reachable through exports', () => {
  assert.deepEqual(
    Object.keys(pkg.exports).sort(),
    [...pkg.files].sort().map(f => `./${f}`),
  );
});

test('the variants extend the base', () => {
  for (const variant of ['nestjs.json', 'vite.json']) {
    assert.equal(
      read(variant).extends,
      './base.json',
      `${variant} should extend the base`,
    );
  }
});

test('the base is strict', () => {
  const base = read('base.json').compilerOptions;
  assert.equal(base.strict, true);
  assert.equal(base.noUncheckedIndexedAccess, true);
});
