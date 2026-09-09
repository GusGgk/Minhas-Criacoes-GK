export type Locale = 'pt' | 'en';

export type LocalizedText = {
  pt: string;
  en: string;
};

export type Metric = {
  id: string;
  value: string;
  label: LocalizedText;
};



export type GalleryImage = {
  id: string;
  src: string;
  caption: LocalizedText;
  /** contain keeps logos and documents whole; cover fills the frame with photos. */
  fit?: 'cover' | 'contain';
  /** backdrop behind a `contain` image, so light logos do not float on the page colour. */
  background?: string;
};

export type VideoClip = {
  /** file in the blob store, or any direct video URL */
  src: string;
  /** still shown before playback; without one the browser shows the first frame */
  poster?: string;
  caption: LocalizedText;
};

export type Swatch = {
  id: string;
  name: string;
  hex: string;
  text: string;
};

export type ChapterEntry = {
  id: string;
  title: LocalizedText;
  meta: LocalizedText;
  body: LocalizedText;
  document?: GalleryImage;
  href?: string;
};

/** Side of a two-panel layout a block belongs to; ignored by single-column layouts. */
export type ChapterPanel = 'a' | 'b';

type BlockBase = { id: string; panel?: ChapterPanel };

/** Composable modules a chapter is assembled from. */
export type ChapterBlock =
  | (BlockBase & { kind: 'gallery'; label?: LocalizedText; note?: LocalizedText; images: GalleryImage[] })
  | (BlockBase & { kind: 'stats'; label?: LocalizedText; note?: LocalizedText; metrics: Metric[] })
  | (BlockBase & { kind: 'quote'; text: LocalizedText; source?: LocalizedText })
  | (BlockBase & { kind: 'entries'; label?: LocalizedText; entries: ChapterEntry[] })
  | (BlockBase & { kind: 'swatches'; label?: LocalizedText; colors: Swatch[] })
  | (BlockBase & { kind: 'chips'; label?: LocalizedText; items: LocalizedText[] })
  | (BlockBase & { kind: 'video'; label?: LocalizedText; note?: LocalizedText; clip: VideoClip });



/** A shelf in the cabin. Categories carry the colour; creations inherit it. */
export type Category = {
  id: string;
  name: LocalizedText;
  accent: string;
  /** stands in for the list while the shelf is still empty */
  empty?: LocalizedText;
};

/** One thing he made. Opening it takes over the whole page. */
export type Creation = {
  id: string;
  slug: string;
  categoryId: string;
  name: LocalizedText;
  tagline: LocalizedText;
  year: LocalizedText;
  cover?: GalleryImage;
  body: LocalizedText[];
  blocks: ChapterBlock[];
  link?: { href: string; label: LocalizedText };
  footnote?: LocalizedText;
  /** decorative canvas rendered alongside the blocks */
  visual?: 'constellation';
  /** how this one announces itself when it takes the room */
  signature?:
    | 'broadcast'
    | 'palette'
    | 'deal'
    | 'graph'
    | 'reel'
    | 'essay'
    | 'dossier'
    | 'gift'
    | 'arcade';
};

export type SiteContent = {
  hero: {
    eyebrow: LocalizedText;
    title: LocalizedText;
    lead: LocalizedText;
  };
  categories: Category[];
  creations: Creation[];
};
