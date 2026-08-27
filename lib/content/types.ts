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
  stat: string;
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

export type SiteContent = {
  hero: {
    eyebrow: LocalizedText;
    title: LocalizedText;
    lead: LocalizedText;
  };
  metrics: Metric[];
  story: StoryStep[];
  projects: Project[];
};
