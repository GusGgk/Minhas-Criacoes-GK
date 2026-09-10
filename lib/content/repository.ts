import { asc, count, eq, max } from 'drizzle-orm';
import { ensureDatabase } from '@/db/bootstrap';
import { getDb } from '@/db/index';
import { categories as categoriesTable, creations as creationsTable, siteSettings } from '@/db/schema';
import { defaultContent } from './default-content';
import type { Category, Creation, SiteContent } from './types';
import type { EditableCategory, EditableCreation } from './creation-validation';

type CategoryRow = typeof categoriesTable.$inferSelect;
type CreationRow = typeof creationsTable.$inferSelect;

/** A locale pair falls back to Portuguese whenever English was left blank. */
function pair(pt: string, en: string) {
  return { pt, en: en || pt };
}

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    accent: row.accent,
    name: pair(row.namePt, row.nameEn),
    empty: row.emptyPt ? pair(row.emptyPt, row.emptyEn ?? '') : undefined,
  };
}

function rowToCreation(row: CreationRow): Creation {
  return {
    id: row.id,
    slug: row.slug,
    categoryId: row.categoryId,
    name: pair(row.namePt, row.nameEn),
    tagline: pair(row.taglinePt, row.taglineEn),
    year: pair(row.yearPt, row.yearEn),
    cover: row.cover ?? undefined,
    body: row.body ?? [],
    blocks: row.blocks ?? [],
    link: row.link ?? undefined,
    footnote: row.footnote ?? undefined,
    signature: (row.signature as Creation['signature']) ?? undefined,
    visual: (row.visual as Creation['visual']) ?? undefined,
  };
}

/** Shelves and what sits on them, in the order the panel put them. */
async function readCabin() {
  const db = getDb();
  const [shelfRows, madeRows] = await Promise.all([
    db.select().from(categoriesTable)
      .where(eq(categoriesTable.visible, true))
      .orderBy(asc(categoriesTable.position)),
    db.select().from(creationsTable)
      .where(eq(creationsTable.visible, true))
      .orderBy(asc(creationsTable.position)),
  ]);
  return {
    categories: shelfRows.map(rowToCategory),
    creations: madeRows.map(rowToCreation),
  };
}

export async function getPublishedContent(): Promise<SiteContent> {
  try {
    await ensureDatabase();
    const [cabin, hero] = await Promise.all([readCabin(), readHero()]);
    return {
      ...defaultContent,
      hero: hero ?? defaultContent.hero,
      // An empty cabin means the seed has not run yet, so keep the bundled one
      // rather than rendering a site with no shelves at all.
      categories: cabin.categories.length ? cabin.categories : defaultContent.categories,
      creations: cabin.creations.length ? cabin.creations : defaultContent.creations,
    };
  } catch (error) {
    console.warn('Using bundled content fallback:', error);
    return defaultContent;
  }
}

/* ---------------------------------------------------------------
   Write side of the cabin. Everything the panel does lands here.
   --------------------------------------------------------------- */

/** Columns shared by insert and update, so the two never drift apart. */
function creationToRow(input: EditableCreation, updatedAt: number) {
  return {
    slug: input.slug,
    categoryId: input.categoryId,
    visible: input.visible !== false,
    signature: input.signature ?? null,
    visual: input.visual ?? null,
    namePt: input.name.pt,
    nameEn: input.name.en,
    taglinePt: input.tagline.pt,
    taglineEn: input.tagline.en,
    yearPt: input.year.pt,
    yearEn: input.year.en,
    cover: input.cover ?? null,
    body: input.body,
    blocks: input.blocks,
    link: input.link ?? null,
    footnote: input.footnote ?? null,
    updatedAt,
  };
}

export async function listAllCreations(): Promise<(Creation & { visible: boolean; position: number })[]> {
  await ensureDatabase();
  const rows = await getDb().select().from(creationsTable).orderBy(asc(creationsTable.position));
  return rows.map((row) => ({ ...rowToCreation(row), visible: row.visible, position: row.position }));
}

export async function listAllCategories(): Promise<(Category & { visible: boolean; position: number })[]> {
  await ensureDatabase();
  const rows = await getDb().select().from(categoriesTable).orderBy(asc(categoriesTable.position));
  return rows.map((row) => ({ ...rowToCategory(row), visible: row.visible, position: row.position }));
}

export async function createCreation(input: EditableCreation): Promise<Creation> {
  await ensureDatabase();
  const db = getDb();
  const [last] = await db.select({ value: max(creationsTable.position) }).from(creationsTable);
  const now = Date.now();
  const [row] = await db.insert(creationsTable).values({
    id: crypto.randomUUID(),
    position: Number(last?.value ?? -1) + 1,
    createdAt: now,
    ...creationToRow(input, now),
  }).returning();
  return rowToCreation(row);
}

export async function updateCreation(id: string, input: EditableCreation): Promise<Creation> {
  await ensureDatabase();
  const [row] = await getDb().update(creationsTable)
    .set(creationToRow(input, Date.now()))
    .where(eq(creationsTable.id, id))
    .returning();
  if (!row) throw new Error('NOT_FOUND');
  return rowToCreation(row);
}

export async function deleteCreation(id: string): Promise<void> {
  await ensureDatabase();
  const rows = await getDb().delete(creationsTable).where(eq(creationsTable.id, id)).returning({ id: creationsTable.id });
  if (rows.length === 0) throw new Error('NOT_FOUND');
}

export async function reorderCreations(ids: string[]): Promise<void> {
  await ensureDatabase();
  const db = getDb();
  const now = Date.now();
  // Small lists, and a transaction keeps the wall from showing a half-applied order.
  await db.transaction(async (tx) => {
    for (const [position, id] of ids.entries()) {
      await tx.update(creationsTable).set({ position, updatedAt: now }).where(eq(creationsTable.id, id));
    }
  });
}

export async function createCategory(input: EditableCategory): Promise<Category> {
  await ensureDatabase();
  const db = getDb();
  const [last] = await db.select({ value: max(categoriesTable.position) }).from(categoriesTable);
  const now = Date.now();
  const [row] = await db.insert(categoriesTable).values({
    id: input.id ?? crypto.randomUUID(),
    position: Number(last?.value ?? -1) + 1,
    visible: input.visible !== false,
    accent: input.accent,
    namePt: input.name.pt,
    nameEn: input.name.en,
    emptyPt: input.empty?.pt ?? null,
    emptyEn: input.empty?.en ?? null,
    createdAt: now,
    updatedAt: now,
  }).returning();
  return rowToCategory(row);
}

export async function updateCategory(id: string, input: EditableCategory): Promise<Category> {
  await ensureDatabase();
  const [row] = await getDb().update(categoriesTable).set({
    visible: input.visible !== false,
    accent: input.accent,
    namePt: input.name.pt,
    nameEn: input.name.en,
    emptyPt: input.empty?.pt ?? null,
    emptyEn: input.empty?.en ?? null,
    updatedAt: Date.now(),
  }).where(eq(categoriesTable.id, id)).returning();
  if (!row) throw new Error('NOT_FOUND');
  return rowToCategory(row);
}

/** Refuses while anything still sits on the shelf, so nothing is orphaned. */
export async function deleteCategory(id: string): Promise<void> {
  await ensureDatabase();
  const db = getDb();
  const [used] = await db.select({ total: count() }).from(creationsTable).where(eq(creationsTable.categoryId, id));
  if (Number(used?.total ?? 0) > 0) throw new Error('CATEGORY_IN_USE');
  const rows = await db.delete(categoriesTable).where(eq(categoriesTable.id, id)).returning({ id: categoriesTable.id });
  if (rows.length === 0) throw new Error('NOT_FOUND');
}

export async function reorderCategories(ids: string[]): Promise<void> {
  await ensureDatabase();
  const db = getDb();
  const now = Date.now();
  await db.transaction(async (tx) => {
    for (const [position, id] of ids.entries()) {
      await tx.update(categoriesTable).set({ position, updatedAt: now }).where(eq(categoriesTable.id, id));
    }
  });
}

/* ---------------------------------------------------------------
   Home texts. One row in site_settings, so the wall's opening lines
   are editable without a table of their own.
   --------------------------------------------------------------- */

const HERO_KEY = 'hero';

async function readHero(): Promise<SiteContent['hero'] | null> {
  const [row] = await getDb().select().from(siteSettings).where(eq(siteSettings.key, HERO_KEY));
  if (!row) return null;
  try {
    return JSON.parse(row.valueJson) as SiteContent['hero'];
  } catch {
    // A malformed row should not blank the page; the bundled text takes over.
    console.warn('Hero salvo está corrompido, usando o texto do código.');
    return null;
  }
}

export async function getHero(): Promise<SiteContent['hero']> {
  await ensureDatabase();
  return (await readHero()) ?? defaultContent.hero;
}

export async function saveHero(hero: SiteContent['hero']): Promise<SiteContent['hero']> {
  await ensureDatabase();
  const now = Date.now();
  await getDb().insert(siteSettings)
    .values({ key: HERO_KEY, valueJson: JSON.stringify(hero), updatedAt: now })
    .onConflictDoUpdate({ target: siteSettings.key, set: { valueJson: JSON.stringify(hero), updatedAt: now } });
  return hero;
}
