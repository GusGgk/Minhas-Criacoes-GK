import { asc, eq, max } from 'drizzle-orm';
import { ensureDatabase } from '@/db/bootstrap';
import { getDb } from '@/db/index';
import { contentItems } from '@/db/schema';
import { defaultContent } from './default-content';
import type { Project, SiteContent } from './types';
import type { EditableProject } from './validation';

type ContentRow = typeof contentItems.$inferSelect;

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
    visible: row.visible,
    featured: row.featured,
    accent: row.accent,
    year: row.year,
    tags: parseJson(row.tagsJson, [] as string[]),
    metrics: parseJson(row.metricsJson, undefined as Project['metrics']),
    href: row.href ?? undefined,
    title: { pt: row.titlePt, en: row.titleEn || row.titlePt },
    category: { pt: row.categoryPt, en: row.categoryEn || row.categoryPt },
    summary: { pt: row.summaryPt, en: row.summaryEn || row.summaryPt },
    image: row.imageUrl,
    alt: { pt: row.altPt, en: row.altEn || row.altPt },
  };
}

function toRow(input: EditableProject, updatedAt: number) {
  return {
    slug: input.slug,
    kind: input.kind,
    visible: input.visible,
    featured: input.featured,
    accent: input.accent,
    year: input.year,
    tagsJson: JSON.stringify(input.tags),
    metricsJson: input.metrics ? JSON.stringify(input.metrics) : null,
    href: input.href ?? null,
    titlePt: input.title.pt,
    titleEn: input.title.en,
    categoryPt: input.category.pt,
    categoryEn: input.category.en,
    summaryPt: input.summary.pt,
    summaryEn: input.summary.en,
    imageUrl: input.image,
    altPt: input.alt.pt,
    altEn: input.alt.en,
    updatedAt,
  };
}

export async function getPublishedContent(): Promise<SiteContent> {
  try {
    await ensureDatabase();
    const rows = await getDb().select().from(contentItems)
      .where(eq(contentItems.visible, true))
      .orderBy(asc(contentItems.position));
    return { ...defaultContent, projects: rows.map(rowToProject) };
  } catch (error) {
    console.warn('Using bundled content fallback:', error);
    return defaultContent;
  }
}

export async function listAllProjects(): Promise<Project[]> {
  await ensureDatabase();
  const rows = await getDb().select().from(contentItems).orderBy(asc(contentItems.position));
  return rows.map(rowToProject);
}

export async function createProject(input: EditableProject): Promise<Project> {
  await ensureDatabase();
  const db = getDb();
  const [{ value: maxPosition }] = await db.select({ value: max(contentItems.position) }).from(contentItems);
  const position = (maxPosition ?? -1) + 1;
  const id = crypto.randomUUID();
  const now = Date.now();
  const [row] = await db.insert(contentItems)
    .values({ id, position, createdAt: now, ...toRow(input, now) })
    .returning();
  return rowToProject(row);
}

export async function updateProject(id: string, input: EditableProject): Promise<Project> {
  await ensureDatabase();
  const db = getDb();
  const [existing] = await db.select({ position: contentItems.position })
    .from(contentItems).where(eq(contentItems.id, id));
  if (!existing) throw new Error('NOT_FOUND');
  const [row] = await db.update(contentItems)
    .set(toRow(input, Date.now()))
    .where(eq(contentItems.id, id))
    .returning();
  return rowToProject(row);
}

export async function deleteProject(id: string): Promise<void> {
  await ensureDatabase();
  const deleted = await getDb().delete(contentItems)
    .where(eq(contentItems.id, id))
    .returning({ id: contentItems.id });
  if (deleted.length === 0) throw new Error('NOT_FOUND');
}

export async function reorderProjects(ids: string[]): Promise<void> {
  await ensureDatabase();
  const db = getDb();
  const now = Date.now();
  await Promise.all(ids.map((id, position) => db.update(contentItems)
    .set({ position, updatedAt: now })
    .where(eq(contentItems.id, id))));
}
