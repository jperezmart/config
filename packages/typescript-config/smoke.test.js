// The tsconfigs ship no code, so the thing worth checking is that the two
// variants still point at the base after any edit, and that `files` and
// `exports` agree — a mismatch publishes a package whose subpath 404s.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = name =>
  JSON.parse(readFileSync(new URL(`./${name}`, import.meta.url), 'utf8'));

const pkg = read('package.json');

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
