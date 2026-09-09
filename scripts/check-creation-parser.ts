/**
 * Round-trips every seeded creation through the panel's validator.
 * If this fails, the admin would refuse to re-save content the site already
 * renders — the kind of break that only shows up when you try to edit.
 *
 * Run with: npm run check:content
 */
import { categories, creations } from '../lib/content/creations';
import { parseCategoryInput, parseCreationInput } from '../lib/content/creation-validation';

let failures = 0;

for (const creation of creations) {
  try {
    const parsed = parseCreationInput(creation);
    const problems: string[] = [];
    if (parsed.slug !== creation.slug) problems.push(`slug virou "${parsed.slug}"`);
    if (parsed.blocks.length !== creation.blocks.length) {
      problems.push(`blocos: ${creation.blocks.length} entraram, ${parsed.blocks.length} saíram`);
    }
    if (parsed.body.length !== creation.body.length) {
      problems.push(`parágrafos: ${creation.body.length} entraram, ${parsed.body.length} saíram`);
    }
    if (Boolean(parsed.cover) !== Boolean(creation.cover)) problems.push('capa sumiu ou apareceu');
    if (parsed.signature !== creation.signature) problems.push(`assinatura virou "${parsed.signature}"`);

    // Compare block kinds one by one, so a silently dropped gallery is caught.
    creation.blocks.forEach((block, i) => {
      if (parsed.blocks[i]?.kind !== block.kind) {
        problems.push(`bloco ${i + 1} era ${block.kind} e virou ${parsed.blocks[i]?.kind ?? 'nada'}`);
      }
    });

    if (problems.length) {
      failures += 1;
      console.log(`FALHA  ${creation.slug}: ${problems.join('; ')}`);
    } else {
      console.log(`ok     ${creation.slug.padEnd(24)} ${parsed.blocks.length} bloco(s)`);
    }
  } catch (error) {
    failures += 1;
    console.log(`ERRO   ${creation.slug}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

for (const category of categories) {
  try {
    const parsed = parseCategoryInput(category);
    if (parsed.name.pt !== category.name.pt) throw new Error('nome mudou');
    console.log(`ok     prateleira ${category.id}`);
  } catch (error) {
    failures += 1;
    console.log(`ERRO   prateleira ${category.id}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(failures === 0 ? '\nTudo passou pelo validador sem perda.' : `\n${failures} problema(s).`);
process.exit(failures === 0 ? 0 : 1);
