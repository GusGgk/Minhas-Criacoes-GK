import { env } from 'cloudflare:workers';
import { defaultContent } from '@/lib/content/default-content';

let pending: Promise<void> | null = null;

export async function ensureDatabase(): Promise<void> {
  if (!pending) pending = initialize().catch((error) => { pending = null; throw error; });
  return pending;
}

async function initialize() {
  const d1 = env.DB;
  if (!d1) throw new Error('D1 binding is unavailable.');

  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS content_items (
      id TEXT PRIMARY KEY NOT NULL,
      slug TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'project' CHECK (kind IN ('project', 'highlight')),
      position INTEGER NOT NULL DEFAULT 0,
      visible INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
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
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`),
    d1.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_content_items_slug ON content_items (slug)'),
    d1.prepare('CREATE INDEX IF NOT EXISTS idx_content_items_visible_position ON content_items (visible, position)'),
    d1.prepare('CREATE INDEX IF NOT EXISTS idx_content_items_kind_position ON content_items (kind, position)'),
    d1.prepare(`CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY NOT NULL,
      storage_key TEXT NOT NULL,
      filename TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )`),
    d1.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_media_assets_storage_key ON media_assets (storage_key)'),
    d1.prepare(`CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )`),
  ]);

  const existing = await d1.prepare('SELECT COUNT(*) AS total FROM content_items').first<{ total: number }>();
  if (Number(existing?.total ?? 0) > 0) return;

  const now = Date.now();
  await d1.batch(defaultContent.projects.map((project) => d1.prepare(`INSERT INTO content_items (
    id, slug, kind, position, visible, featured, accent, year, tags_json, metrics_json, href,
    title_pt, title_en, category_pt, category_en, summary_pt, summary_en, image_url, alt_pt, alt_en,
    created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      project.id, project.slug, project.kind, project.position, project.visible ? 1 : 0,
      project.featured ? 1 : 0, project.accent, project.year, JSON.stringify(project.tags),
      project.metrics ? JSON.stringify(project.metrics) : null, project.href ?? null,
      project.title.pt, project.title.en, project.category.pt, project.category.en,
      project.summary.pt, project.summary.en, project.image, project.alt.pt, project.alt.en,
      now, now,
    )));

  await d1.prepare('PRAGMA optimize').run();
}
