import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function readBundleBlock(type) {
  const pattern = new RegExp(
    `<script\\s+type=["']__bundler/${type}["'][^>]*>([\\s\\S]*?)<\\/script>`,
    'i',
  );
  const match = source.match(pattern);
  if (!match) throw new Error(`Missing legacy bundle block: ${type}`);
  return JSON.parse(match[1]);
}

const manifest = readBundleBlock('manifest');
const template = readBundleBlock('template');
const externalResources = readBundleBlock('ext_resources');
const outputRoot = new URL('../public/media/', import.meta.url);

const mimeExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'font/woff2': '.woff2',
};

const legacyPaths = new Map();
for (const match of template.matchAll(/\{\s*src:\s*['"]([^'"]+)['"],\s*rid:\s*['"]([^'"]+)['"]\s*\}/g)) {
  legacyPaths.set(match[2], match[1].replace(/^assets\//, ''));
}

for (const [id, path] of Object.entries({
  m1: 'mirtillo/mirtillo-app.png',
  m2: 'mirtillo/mirtillo-logo.webp',
  m3: 'mirtillo/mirtillo-icon-v2.png',
  m4: 'mirtillo/mirtillo-berry.webp',
  c1: 'comprovacoes/declaracao-representante-turma.png',
  c2: 'comprovacoes/declaracao-tesoureiro-cabes.png',
})) {
  legacyPaths.set(id, path);
}

const directImagePaths = {
  '8baf0ed2-d4e3-4bbc-8448-d26c69fe8a7d': 'comprovacoes/certificado-pibep.png',
  'fa06d77a-773c-4e5a-9cc2-4f8952a4c316': 'decisao/banner-canal.png',
  '396d80f9-0383-4775-9dcd-1a9ae0cbc4f5': 'esporte/equipe.jpg',
  '3703d988-3c66-451b-8aa1-97dceaf874e9': 'esporte/partida.jpg',
  '0062ceff-4974-452c-b2fa-5532dafbab24': 'esporte/premiacao.jpg',
  'acd2a96e-22ce-4e69-ac5a-6bc96635845e': 'comprovacoes/feedback-professor.png',
  '0dc9db9f-5620-4eb6-9394-3748ad814a55': 'esporte/campeonato.jpg',
  '560c30ad-de29-41c0-a879-a1856f6f0908': 'pessoais/site-presente.png',
  'f9588b17-48a9-449d-8649-5c9bab1221cf': 'pessoais/abimaball.png',
};

await mkdir(outputRoot, { recursive: true });

const exported = [];
for (const entry of externalResources) {
  const asset = manifest[entry.uuid];
  if (!asset || !mimeExtensions[asset.mime]) continue;

  let relativePath = legacyPaths.get(entry.id);
  if (!relativePath) {
    relativePath = `legacy/${entry.id}${mimeExtensions[asset.mime]}`;
  } else if (!extname(relativePath)) {
    relativePath += mimeExtensions[asset.mime];
  }

  const normalizedPath = normalize(relativePath).replace(/^(\.\.[/\\])+/, '');
  const target = new URL(normalizedPath.replaceAll('\\', '/'), outputRoot);
  await mkdir(new URL('./', target), { recursive: true });

  const compressed = Buffer.from(asset.data, 'base64');
  const bytes = asset.compressed ? gunzipSync(compressed) : compressed;
  await writeFile(target, bytes);
  exported.push({ id: entry.id, uuid: entry.uuid, path: `/media/${normalizedPath.replaceAll('\\', '/')}` });
}

for (const [uuid, relativePath] of Object.entries(directImagePaths)) {
  const asset = manifest[uuid];
  if (!asset) continue;
  const target = new URL(relativePath, outputRoot);
  await mkdir(new URL('./', target), { recursive: true });
  const compressed = Buffer.from(asset.data, 'base64');
  await writeFile(target, asset.compressed ? gunzipSync(compressed) : compressed);
  exported.push({ id: uuid, uuid, path: `/media/${relativePath}` });
}

for (const [uuid, asset] of Object.entries(manifest)) {
  if (!asset.mime?.startsWith('font/')) continue;
  const target = new URL(`fonts/${uuid}${mimeExtensions[asset.mime] ?? ''}`, outputRoot);
  await mkdir(new URL('./', target), { recursive: true });
  const compressed = Buffer.from(asset.data, 'base64');
  await writeFile(target, asset.compressed ? gunzipSync(compressed) : compressed);
}

await writeFile(
  join(fileURLToPath(outputRoot), 'legacy-manifest.json'),
  `${JSON.stringify(exported, null, 2)}\n`,
  'utf8',
);

console.log(`Exported ${exported.length} legacy resources and ${Object.values(manifest).filter((asset) => asset.mime?.startsWith('font/')).length} fonts.`);
