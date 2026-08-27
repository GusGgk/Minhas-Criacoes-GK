import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const contentItems = sqliteTable('content_items', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  kind: text('kind', { enum: ['project', 'highlight'] }).notNull().default('project'),
  position: integer('position').notNull().default(0),
  visible: integer('visible', { mode: 'boolean' }).notNull().default(true),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  accent: text('accent').notNull().default('#ff6b4a'),
  year: text('year').notNull().default('2026'),
  tagsJson: text('tags_json').notNull().default('[]'),
  metricsJson: text('metrics_json'),
  href: text('href'),
  titlePt: text('title_pt').notNull(),
  titleEn: text('title_en').notNull().default(''),
  categoryPt: text('category_pt').notNull(),
  categoryEn: text('category_en').notNull().default(''),
  summaryPt: text('summary_pt').notNull(),
  summaryEn: text('summary_en').notNull().default(''),
  imageUrl: text('image_url').notNull(),
  altPt: text('alt_pt').notNull(),
  altEn: text('alt_en').notNull().default(''),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => [
  uniqueIndex('idx_content_items_slug').on(table.slug),
  index('idx_content_items_visible_position').on(table.visible, table.position),
  index('idx_content_items_kind_position').on(table.kind, table.position),
]);

export const mediaAssets = sqliteTable('media_assets', {
  id: text('id').primaryKey(),
  storageKey: text('storage_key').notNull(),
  filename: text('filename').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => [uniqueIndex('idx_media_assets_storage_key').on(table.storageKey)]);

export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  valueJson: text('value_json').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
