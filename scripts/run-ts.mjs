/**
 * Runs a TypeScript script that imports from the app source.
 *
 * Node can strip types on its own, but only with explicit file extensions in
 * every import, and the app source uses extensionless ones. Bundling with the
 * esbuild that already ships inside the toolchain avoids touching that source.
 *
 * Usage: node scripts/run-ts.mjs scripts/whatever.ts
 */
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const entry = process.argv[2];
if (!entry) {
  console.error('Informe o arquivo .ts a executar.');
  process.exit(1);
}

const dir = await mkdtemp(join(tmpdir(), 'gk-run-'));
const outfile = join(dir, 'bundle.mjs');

try {
  await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'error' });
  await import(pathToFileURL(outfile).href);
} finally {
  await rm(dir, { recursive: true, force: true });
}
