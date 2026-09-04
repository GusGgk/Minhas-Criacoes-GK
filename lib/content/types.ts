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

export type StoryStep = {
  id: string;
  index: string;
  title: LocalizedText;
  eyebrow: LocalizedText;
  body: LocalizedText;
  stat: LocalizedText;
  accent: string;
};

export type Project = {
  id: string;
  slug: string;
  kind: 'project' | 'highlight';
  category: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  image: string;
  alt: LocalizedText;
  accent: string;
  year: string;
  tags: string[];
  href?: string;
  featured: boolean;
  visible: boolean;
  position: number;
  metrics?: Metric[];
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
  | (BlockBase & { kind: 'chips'; label?: LocalizedText; items: LocalizedText[] });

/** Each chapter is composed differently; the layout picks which one. */
export type ChapterLayout =
  | 'broadcast'
  | 'manual'
  | 'split'
  | 'contact-sheet'
  | 'photo-essay'
  | 'dossier'
  | 'playful';

export type Chapter = {
  id: string;
  /** anchor used by the chapter index and the deep links */
  anchor: string;
  index: string;
  nav: LocalizedText;
  kicker: LocalizedText;
  title: LocalizedText;
  lead: LocalizedText;
  /** the personal part: one paragraph per entry */
  body: LocalizedText[];
  accent: string;
  /** alternating background, so consecutive chapters stay visually separated */
  tone: 'ink' | 'paper';
  layout: ChapterLayout;
  /** id of the story step this chapter answers, printed in the header as a back-link */
  reasonId: string;
  /** scrolling strip, only used by the broadcast layout */
  marquee?: LocalizedText;
  /** decorative canvas rendered inside the chapter */
  visual?: 'constellation';
  cover?: GalleryImage;
  link?: { href: string; label: LocalizedText };
  footnote?: LocalizedText;
  blocks: ChapterBlock[];
  /** project slugs already told in full here, so the archive does not repeat them */
  coveredSlugs: string[];
};

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
  metrics: Metric[];
  story: StoryStep[];
  chapters: Chapter[];
  categories: Category[];
  creations: Creation[];
  projects: Project[];
};
