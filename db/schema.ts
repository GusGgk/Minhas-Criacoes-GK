import { bigint, boolean, index, integer, jsonb, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import type { ChapterBlock, GalleryImage, LocalizedText } from '@/lib/content/types';

export const mediaAssets = pgTable('media_assets', {
  id: text('id').primaryKey(),
  storageKey: text('storage_key').notNull(),
  url: text('url').notNull().default(''),
  filename: text('filename').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
}, (table) => [uniqueIndex('idx_media_assets_storage_key').on(table.storageKey)]);

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  valueJson: text('value_json').notNull(),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
});

/* ---------------------------------------------------------------
   The cabin, editable. Categories are shelves; creations sit on
   them. The parts that vary in shape (cover, body, blocks) are
   JSONB because blocks are a discriminated union — normalising
   them would buy nothing and cost every read a set of joins.
   --------------------------------------------------------------- */

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  position: integer('position').notNull().default(0),
  visible: boolean('visible').notNull().default(true),
  accent: text('accent').notNull().default('#ff6b4a'),
  namePt: text('name_pt').notNull(),
  nameEn: text('name_en').notNull().default(''),
  emptyPt: text('empty_pt'),
  emptyEn: text('empty_en'),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
}, (table) => [index('idx_categories_visible_position').on(table.visible, table.position)]);

export const creations = pgTable('creations', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  categoryId: text('category_id').notNull(),
  position: integer('position').notNull().default(0),
  visible: boolean('visible').notNull().default(true),
  /** entrance choreography; null falls back to the shared opening */
  signature: text('signature'),
  /** decorative canvas, when the creation calls for one */
  visual: text('visual'),
  namePt: text('name_pt').notNull(),
  nameEn: text('name_en').notNull().default(''),
  taglinePt: text('tagline_pt').notNull().default(''),
  taglineEn: text('tagline_en').notNull().default(''),
  yearPt: text('year_pt').notNull().default(''),
  yearEn: text('year_en').notNull().default(''),
  cover: jsonb('cover').$type<GalleryImage | null>(),
  body: jsonb('body').$type<LocalizedText[]>().notNull().default([]),
  blocks: jsonb('blocks').$type<ChapterBlock[]>().notNull().default([]),
  link: jsonb('link').$type<{ href: string; label: LocalizedText } | null>(),
  footnote: jsonb('footnote').$type<LocalizedText | null>(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
}, (table) => [
  uniqueIndex('idx_creations_slug').on(table.slug),
  index('idx_creations_category_position').on(table.categoryId, table.position),
  index('idx_creations_visible_position').on(table.visible, table.position),
]);
