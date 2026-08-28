import { count, sql } from 'drizzle-orm';
import { defaultContent } from '@/lib/content/default-content';
import { getDb } from './index';
import { contentItems } from './schema';

let pending: Promise<void> | null = null;

export async function ensureDatabase(): Promise<void> {
  if (!pending) pending = initialize().catch((error) => { pending = null; throw error; });
  return pending;
}

async function initialize() {
  const db = getDb();

  const statements = [
    sql`CREATE TABLE IF NOT EXISTS content_items (
      id TEXT PRIMARY KEY NOT NULL,
      slug TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'project' CHECK (kind IN ('project', 'highlight')),
      position INTEGER NOT NULL DEFAULT 0,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      accent TEXT NOT NULL DEFAULT '#ff6b4a',
      year TEXT NOT NULL DEFAULT '2026',
      tags_json TEXT NOT NULL DEFAULT '[]',
      metrics_json TEXT,
      href TEXT,
      title_pt TEXT NOT NULL,
      title_en TEXT NOT NULL DEFAULT '',
      category_pt TEXT NOT NULL,
      category_en TEXT NOT NULL DEFAULT '',
      summary_pt TEXT NOT NULL,
      summary_en TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL,
      alt_pt TEXT NOT NULL,
      alt_en TEXT NOT NULL DEFAULT '',
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    )`,
    sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_content_items_slug ON content_items (slug)`,
    sql`CREATE INDEX IF NOT EXISTS idx_content_items_visible_position ON content_items (visible, position)`,
    sql`CREATE INDEX IF NOT EXISTS idx_content_items_kind_position ON content_items (kind, position)`,
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
    sql`CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value_json TEXT NOT NULL,
      updated_at BIGINT NOT NULL
    )`,
  ];

  for (const statement of statements) await db.execute(statement);

  const [row] = await db.select({ total: count() }).from(contentItems);
  if (Number(row?.total ?? 0) > 0) return;

  const now = Date.now();
  await db.insert(contentItems).values(defaultContent.projects.map((project) => ({
    id: project.id,
    slug: project.slug,
    kind: project.kind,
    position: project.position,
    visible: project.visible,
    featured: project.featured,
    accent: project.accent,
    year: project.year,
    tagsJson: JSON.stringify(project.tags),
    metricsJson: project.metrics ? JSON.stringify(project.metrics) : null,
    href: project.href ?? null,
    titlePt: project.title.pt,
    titleEn: project.title.en,
    categoryPt: project.category.pt,
    categoryEn: project.category.en,
    summaryPt: project.summary.pt,
    summaryEn: project.summary.en,
    imageUrl: project.image,
    altPt: project.alt.pt,
    altEn: project.alt.en,
    createdAt: now,
    updatedAt: now,
  })));
}
