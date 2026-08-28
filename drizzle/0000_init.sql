CREATE TABLE "content_items" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"kind" text DEFAULT 'project' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"accent" text DEFAULT '#ff6b4a' NOT NULL,
	"year" text DEFAULT '2026' NOT NULL,
	"tags_json" text DEFAULT '[]' NOT NULL,
	"metrics_json" text,
	"href" text,
	"title_pt" text NOT NULL,
	"title_en" text DEFAULT '' NOT NULL,
	"category_pt" text NOT NULL,
	"category_en" text DEFAULT '' NOT NULL,
	"summary_pt" text NOT NULL,
	"summary_en" text DEFAULT '' NOT NULL,
	"image_url" text NOT NULL,
	"alt_pt" text NOT NULL,
	"alt_en" text DEFAULT '' NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"storage_key" text NOT NULL,
	"url" text DEFAULT '' NOT NULL,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value_json" text NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_content_items_slug" ON "content_items" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_content_items_visible_position" ON "content_items" USING btree ("visible","position");--> statement-breakpoint
CREATE INDEX "idx_content_items_kind_position" ON "content_items" USING btree ("kind","position");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_media_assets_storage_key" ON "media_assets" USING btree ("storage_key");