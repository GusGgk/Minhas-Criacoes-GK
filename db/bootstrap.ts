import { count, sql } from 'drizzle-orm';
import { categories as seedCategories, creations as seedCreations } from '@/lib/content/creations';
import { getDb } from './index';
import { categories, creations } from './schema';

let pending: Promise<void> | null = null;

export async function ensureDatabase(): Promise<void> {
  if (!pending) pending = initialize().catch((error) => { pending = null; throw error; });
  return pending;
}

async function initialize() {
  const db = getDb();

  const statements = [
    sql`CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY NOT NULL,
      storage_key TEXT NOT NULL,
      url TEXT NOT NULL DEFAULT '',
      filename TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at BIGINT NOT NULL
    )`,
    sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_media_assets_storage_key ON media_assets (storage_key)`,
    sql`CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      accent TEXT NOT NULL DEFAULT '#ff6b4a',
      name_pt TEXT NOT NULL,
      name_en TEXT NOT NULL DEFAULT '',
      empty_pt TEXT,
      empty_en TEXT,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    )`,
    sql`CREATE INDEX IF NOT EXISTS idx_categories_visible_position ON categories (visible, position)`,
    sql`CREATE TABLE IF NOT EXISTS creations (
      id TEXT PRIMARY KEY NOT NULL,
      slug TEXT NOT NULL,
      category_id TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      signature TEXT,
      visual TEXT,
      name_pt TEXT NOT NULL,
      name_en TEXT NOT NULL DEFAULT '',
      tagline_pt TEXT NOT NULL DEFAULT '',
      tagline_en TEXT NOT NULL DEFAULT '',
      year_pt TEXT NOT NULL DEFAULT '',
      year_en TEXT NOT NULL DEFAULT '',
      cover JSONB,
      body JSONB NOT NULL DEFAULT '[]'::jsonb,
      blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
      link JSONB,
      footnote JSONB,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    )`,
    sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_creations_slug ON creations (slug)`,
    sql`CREATE INDEX IF NOT EXISTS idx_creations_category_position ON creations (category_id, position)`,
    sql`CREATE INDEX IF NOT EXISTS idx_creations_visible_position ON creations (visible, position)`,
    sql`CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value_json TEXT NOT NULL,
      updated_at BIGINT NOT NULL
    )`,
  ];

  for (const statement of statements) await db.execute(statement);

  await seedCabin(db);

}

/**
 * First run copies the cabin out of the code files and into the tables, so the
 * panel has something to edit and the page keeps rendering exactly what it did
 * before. Runs once: a non-empty table is left alone.
 */
async function seedCabin(db: ReturnType<typeof getDb>) {
  const now = Date.now();

  const [shelfRow] = await db.select({ total: count() }).from(categories);
  if (Number(shelfRow?.total ?? 0) === 0 && seedCategories.length > 0) {
    await db.insert(categories).values(seedCategories.map((category, position) => ({
      id: category.id,
      position,
      visible: true,
      accent: category.accent,
      namePt: category.name.pt,
      nameEn: category.name.en,
      emptyPt: category.empty?.pt ?? null,
      emptyEn: category.empty?.en ?? null,
      createdAt: now,
      updatedAt: now,
    })));
  }

  const [madeRow] = await db.select({ total: count() }).from(creations);
  if (Number(madeRow?.total ?? 0) === 0 && seedCreations.length > 0) {
    await db.insert(creations).values(seedCreations.map((creation, position) => ({
      id: creation.id,
      slug: creation.slug,
      categoryId: creation.categoryId,
      position,
      visible: true,
      signature: creation.signature ?? null,
      visual: creation.visual ?? null,
      namePt: creation.name.pt,
      nameEn: creation.name.en,
      taglinePt: creation.tagline.pt,
      taglineEn: creation.tagline.en,
      yearPt: creation.year.pt,
      yearEn: creation.year.en,
      cover: creation.cover ?? null,
      body: creation.body,
      blocks: creation.blocks,
      link: creation.link ?? null,
      footnote: creation.footnote ?? null,
      createdAt: now,
      updatedAt: now,
    })));
  }
}
