// Golden-fixture tests.
//
// Each fixture under `test/fixtures/golden/*.html` is an *input* document
// (pasted content, server round-trips, markdown import). The test loads it into
// a rich-text editor and pins what Lilac actually renders — after sanitization
// and browser normalization — as a snapshot in `__snapshots__`.
//
// This is the "golden master" pattern: an explicit, reviewable record of what
// the editor produces for canonical inputs. A change that alters output
// (sanitizer rules, DOM structure, whitespace handling) shows up here.

import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mountEditor } from './helpers/editor';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(here, 'fixtures', 'golden');

function loadFixtures(): { name: string; html: string }[] {
  return fs
    .readdirSync(fixturesDir)
    .filter((file) => file.endsWith('.html'))
    .sort()
    .map((file) => ({ name: file.replace(/\.html$/, ''), html: fs.readFileSync(path.join(fixturesDir, file), 'utf8') }));
}

describe('golden fixtures', () => {
  it('has at least one canonical fixture', () => {
    const fixtures = loadFixtures();
    expect(fixtures.length).toBeGreaterThan(0);
    expect(fixtures.map((f) => f.name)).toMatchSnapshot('fixture inventory');
  });

  for (const fixture of loadFixtures()) {
    it(`renders ${fixture.name} to the canonical form`, () => {
      const h = mountEditor({ toolbar: { show: true }, initialContent: fixture.html });
      expect(h.markup()).toMatchSnapshot(fixture.name);
      // The text survivors are what a user actually reads.
      const text = h.content.textContent?.replace(/\s+/g, ' ').trim();
      expect(text).toBeTruthy();
      h.cleanup();
    });
  }
});