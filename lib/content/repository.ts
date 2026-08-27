import { env } from 'cloudflare:workers';
import { ensureDatabase } from '@/db/bootstrap';
import { defaultContent } from './default-content';
import type { Project, SiteContent } from './types';
import type { EditableProject } from './validation';

type ContentRow = {
  id: string; slug: string; kind: 'project' | 'highlight'; position: number; visible: number; featured: number;
  accent: string; year: string; tags_json: string; metrics_json: string | null; href: string | null;
  title_pt: string; title_en: string; category_pt: string; category_en: string;
  summary_pt: string; summary_en: string; image_url: string; alt_pt: string; alt_en: string;
};

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function rowToProject(row: ContentRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    position: row.position,
    visible: Boolean(row.visible),
    featured: Boolean(row.featured),
    accent: row.accent,
    year: row.year,
    tags: parseJson(row.tags_json, []),
    metrics: parseJson(row.metrics_json, undefined),
    href: row.href ?? undefined,
    title: { pt: row.title_pt, en: row.title_en || row.title_pt },
    category: { pt: row.category_pt, en: row.category_en || row.category_pt },
    summary: { pt: row.summary_pt, en: row.summary_en || row.summary_pt },
    image: row.image_url,
    alt: { pt: row.alt_pt, en: row.alt_en || row.alt_pt },
  };
}

export async function getPublishedContent(): Promise<SiteContent> {
  try {
    await ensureDatabase();
    const result = await env.DB.prepare('SELECT * FROM content_items WHERE visible = 1 ORDER BY position ASC').all<ContentRow>();
    return { ...defaultContent, projects: result.results.map(rowToProject) };
  } catch (error) {
    console.warn('Using bundled content fallback:', error);
    return defaultContent;
  }
}

export async function listAllProjects(): Promise<Project[]> {
  await ensureDatabase();
  const result = await env.DB.prepare('SELECT * FROM content_items ORDER BY position ASC').all<ContentRow>();
  return result.results.map(rowToProject);
}

export async function createProject(input: EditableProject): Promise<Project> {
  await ensureDatabase();
  const positionResult = await env.DB.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM content_items').first<{ next_position: number }>();
  const id = crypto.randomUUID();
  const position = Number(positionResult?.next_position ?? 0);
  const now = Date.now();
  await env.DB.prepare(`INSERT INTO content_items (
    id, slug, kind, position, visible, featured, accent, year, tags_json, metrics_json, href,
    title_pt, title_en, category_pt, category_en, summary_pt, summary_en, image_url, alt_pt, alt_en,
    created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
    id, input.slug, input.kind, position, input.visible ? 1 : 0, input.featured ? 1 : 0,
    input.accent, input.year, JSON.stringify(input.tags), input.metrics ? JSON.stringify(input.metrics) : null,
    input.href ?? null, input.title.pt, input.title.en, input.category.pt, input.category.en,
    input.summary.pt, input.summary.en, input.image, input.alt.pt, input.alt.en, now, now,
  ).run();
  return { ...input, id, position } as Project;
}

export async function updateProject(id: string, input: EditableProject): Promise<Project> {
  await ensureDatabase();
  const existing = await env.DB.prepare('SELECT position FROM content_items WHERE id = ?').bind(id).first<{ position: number }>();
  if (!existing) throw new Error('NOT_FOUND');
  await env.DB.prepare(`UPDATE content_items SET
    slug = ?, kind = ?, visible = ?, featured = ?, accent = ?, year = ?, tags_json = ?, metrics_json = ?, href = ?,
    title_pt = ?, title_en = ?, category_pt = ?, category_en = ?, summary_pt = ?, summary_en = ?, image_url = ?,
    alt_pt = ?, alt_en = ?, updated_at = ? WHERE id = ?`).bind(
    input.slug, input.kind, input.visible ? 1 : 0, input.featured ? 1 : 0, input.accent, input.year,
    JSON.stringify(input.tags), input.metrics ? JSON.stringify(input.metrics) : null, input.href ?? null,
    input.title.pt, input.title.en, input.category.pt, input.category.en, input.summary.pt, input.summary.en,
    input.image, input.alt.pt, input.alt.en, Date.now(), id,
  ).run();
  return { ...input, id, position: existing.position } as Project;
}

export async function deleteProject(id: string): Promise<void> {
  await ensureDatabase();
  const result = await env.DB.prepare('DELETE FROM content_items WHERE id = ?').bind(id).run();
  if (!result.meta.changes) throw new Error('NOT_FOUND');
}

export async function reorderProjects(ids: string[]): Promise<void> {
  await ensureDatabase();
  await env.DB.batch(ids.map((id, position) => env.DB.prepare('UPDATE content_items SET position = ?, updated_at = ? WHERE id = ?').bind(position, Date.now(), id)));
}
