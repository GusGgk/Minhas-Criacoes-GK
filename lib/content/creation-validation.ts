import type {
  Category,
  ChapterBlock,
  ChapterEntry,
  ChapterPanel,
  Creation,
  GalleryImage,
  LocalizedText,
  Metric,
  Swatch,
} from './types';
import { ValidationError } from './validation';

export type EditableCreation = Omit<Creation, 'id'> & { id?: string; visible?: boolean };
export type EditableCategory = Omit<Category, 'id'> & { id?: string; visible?: boolean };

const SIGNATURES = ['broadcast', 'palette', 'deal', 'graph', 'reel', 'essay', 'dossier', 'gift', 'arcade'] as const;
const BLOCK_KINDS = ['gallery', 'stats', 'quote', 'entries', 'swatches', 'chips', 'video'] as const;
const HEX = /^#[0-9a-f]{6}$/i;

function text(value: unknown, field: string, max: number, required = true): string {
  if (value == null && !required) return '';
  if (typeof value !== 'string') throw new ValidationError(`${field} precisa ser texto.`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new ValidationError(`${field} é obrigatório.`);
  if (trimmed.length > max) throw new ValidationError(`${field} passa de ${max} caracteres.`);
  return trimmed;
}

/** English is optional everywhere; when it is blank the reader sees Portuguese. */
function localized(value: unknown, field: string, max: number, required = true): LocalizedText {
  const record = (value ?? {}) as Record<string, unknown>;
  const pt = text(record.pt, `${field} (PT)`, max, required);
  const en = text(record.en, `${field} (EN)`, max, false);
  return { pt, en };
}

function mediaUrl(value: unknown, field: string, required = true): string {
  const url = text(value, field, 1200, required);
  if (!url) return '';
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    return parsed.toString();
  } catch {
    throw new ValidationError(`${field} precisa ser um endereço http(s) ou um caminho começando com /.`);
  }
}

function hex(value: unknown, field: string, fallback: string): string {
  const raw = text(value, field, 7, false) || fallback;
  if (!HEX.test(raw)) throw new ValidationError(`${field} precisa estar no formato #rrggbb.`);
  return raw.toLowerCase();
}

function list(value: unknown, field: string, max: number): unknown[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new ValidationError(`${field} precisa ser uma lista.`);
  if (value.length > max) throw new ValidationError(`${field} aceita no máximo ${max} itens.`);
  return value;
}

function slugify(value: unknown, field: string): string {
  const slug = text(value, field, 120)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!slug) throw new ValidationError(`${field} não pode ficar vazio depois de normalizado.`);
  return slug;
}

function parseImage(value: unknown, field: string, index: number): GalleryImage {
  const record = (value ?? {}) as Record<string, unknown>;
  const fit = record.fit === 'contain' ? 'contain' : record.fit === 'cover' ? 'cover' : undefined;
  const background = record.background ? hex(record.background, `${field} ${index + 1}: fundo`, '#000000') : undefined;
  return {
    id: text(record.id ?? `img-${index + 1}`, `${field} ${index + 1}: id`, 80),
    src: mediaUrl(record.src, `${field} ${index + 1}: arquivo`),
    caption: localized(record.caption, `${field} ${index + 1}: legenda`, 300, false),
    ...(fit ? { fit } : {}),
    ...(background ? { background } : {}),
  };
}

function parseMetric(value: unknown, index: number): Metric {
  const record = (value ?? {}) as Record<string, unknown>;
  return {
    id: text(record.id ?? `metric-${index + 1}`, `Número ${index + 1}: id`, 80),
    value: text(record.value, `Número ${index + 1}: valor`, 40),
    label: localized(record.label, `Número ${index + 1}: rótulo`, 120),
  };
}

function parseSwatch(value: unknown, index: number): Swatch {
  const record = (value ?? {}) as Record<string, unknown>;
  return {
    id: text(record.id ?? `cor-${index + 1}`, `Cor ${index + 1}: id`, 80),
    name: text(record.name, `Cor ${index + 1}: nome`, 80),
    hex: hex(record.hex, `Cor ${index + 1}`, '#000000'),
    text: hex(record.text, `Cor ${index + 1}: cor do texto`, '#ffffff'),
  };
}

function parseEntry(value: unknown, index: number): ChapterEntry {
  const record = (value ?? {}) as Record<string, unknown>;
  const href = record.href ? mediaUrl(record.href, `Entrada ${index + 1}: link`, false) : '';
  return {
    id: text(record.id ?? `entrada-${index + 1}`, `Entrada ${index + 1}: id`, 80),
    title: localized(record.title, `Entrada ${index + 1}: título`, 160),
    meta: localized(record.meta, `Entrada ${index + 1}: detalhe`, 160, false),
    body: localized(record.body, `Entrada ${index + 1}: texto`, 1200, false),
    ...(record.document ? { document: parseImage(record.document, `Entrada ${index + 1}: documento`, 0) } : {}),
    ...(href ? { href } : {}),
  };
}

function parseBlock(value: unknown, index: number): ChapterBlock {
  const record = (value ?? {}) as Record<string, unknown>;
  const kind = record.kind as (typeof BLOCK_KINDS)[number];
  if (!BLOCK_KINDS.includes(kind)) throw new ValidationError(`Bloco ${index + 1}: tipo desconhecido.`);

  const id = text(record.id ?? `bloco-${index + 1}`, `Bloco ${index + 1}: id`, 80);
  const panel: ChapterPanel | undefined =
    record.panel === 'a' ? 'a' : record.panel === 'b' ? 'b' : undefined;
  const base = { id, ...(panel ? { panel } : {}) };
  const label = record.label ? localized(record.label, `Bloco ${index + 1}: título`, 200, false) : undefined;
  const note = record.note ? localized(record.note, `Bloco ${index + 1}: observação`, 600, false) : undefined;
  const withLabels = { ...base, ...(label ? { label } : {}), ...(note ? { note } : {}) };

  switch (kind) {
    case 'gallery': {
      const images = list(record.images, `Bloco ${index + 1}: imagens`, 40)
        .map((image, i) => parseImage(image, `Bloco ${index + 1}: imagem`, i));
      if (images.length === 0) throw new ValidationError(`Bloco ${index + 1}: uma galeria precisa de ao menos uma imagem.`);
      return { kind, ...withLabels, images };
    }
    case 'stats': {
      const metrics = list(record.metrics, `Bloco ${index + 1}: números`, 8).map(parseMetric);
      if (metrics.length === 0) throw new ValidationError(`Bloco ${index + 1}: adicione ao menos um número.`);
      return { kind, ...withLabels, metrics };
    }
    case 'quote': {
      const source = record.source ? localized(record.source, `Bloco ${index + 1}: autoria`, 300, false) : undefined;
      return { kind, ...base, text: localized(record.text, `Bloco ${index + 1}: citação`, 900), ...(source ? { source } : {}) };
    }
    case 'entries': {
      const entries = list(record.entries, `Bloco ${index + 1}: entradas`, 12).map(parseEntry);
      if (entries.length === 0) throw new ValidationError(`Bloco ${index + 1}: adicione ao menos uma entrada.`);
      return { kind, ...base, ...(label ? { label } : {}), entries };
    }
    case 'swatches': {
      const colors = list(record.colors, `Bloco ${index + 1}: cores`, 16).map(parseSwatch);
      if (colors.length === 0) throw new ValidationError(`Bloco ${index + 1}: adicione ao menos uma cor.`);
      return { kind, ...base, ...(label ? { label } : {}), colors };
    }
    case 'video': {
      const clip = (record.clip ?? {}) as Record<string, unknown>;
      const poster = clip.poster ? mediaUrl(clip.poster, `Bloco ${index + 1}: imagem de capa do vídeo`, false) : '';
      return {
        kind,
        ...withLabels,
        clip: {
          src: mediaUrl(clip.src, `Bloco ${index + 1}: arquivo de vídeo`),
          caption: localized(clip.caption, `Bloco ${index + 1}: legenda do vídeo`, 300, false),
          ...(poster ? { poster } : {}),
        },
      };
    }
    case 'chips': {
      const items = list(record.items, `Bloco ${index + 1}: itens`, 24)
        .map((item, i) => localized(item, `Bloco ${index + 1}: item ${i + 1}`, 80));
      if (items.length === 0) throw new ValidationError(`Bloco ${index + 1}: adicione ao menos um item.`);
      return { kind, ...base, ...(label ? { label } : {}), items };
    }
  }
}

export function parseCreationInput(value: unknown): EditableCreation {
  if (!value || typeof value !== 'object') throw new ValidationError('Conteúdo inválido.');
  const input = value as Record<string, unknown>;

  const signature = SIGNATURES.includes(input.signature as (typeof SIGNATURES)[number])
    ? (input.signature as Creation['signature'])
    : undefined;

  const link = input.link && (input.link as Record<string, unknown>).href
    ? {
        href: mediaUrl((input.link as Record<string, unknown>).href, 'Link: endereço'),
        label: localized((input.link as Record<string, unknown>).label, 'Link: texto', 80),
      }
    : undefined;

  return {
    id: typeof input.id === 'string' && input.id ? input.id : undefined,
    slug: slugify(input.slug, 'Endereço da criação'),
    categoryId: text(input.categoryId, 'Prateleira', 80),
    name: localized(input.name, 'Nome', 160),
    tagline: localized(input.tagline, 'Frase de apresentação', 300, false),
    year: localized(input.year, 'Quando', 80, false),
    cover: input.cover && (input.cover as Record<string, unknown>).src
      ? parseImage(input.cover, 'Capa', 0)
      : undefined,
    body: list(input.body, 'Texto', 12)
      .map((paragraph, i) => localized(paragraph, `Parágrafo ${i + 1}`, 2000, false))
      .filter((paragraph) => paragraph.pt),
    blocks: list(input.blocks, 'Blocos', 20).map(parseBlock),
    link,
    footnote: input.footnote && (input.footnote as Record<string, unknown>).pt
      ? localized(input.footnote, 'Nota de rodapé', 600, false)
      : undefined,
    signature,
    visual: input.visual === 'constellation' ? 'constellation' : undefined,
    visible: input.visible !== false,
  };
}

export function parseCategoryInput(value: unknown): EditableCategory {
  if (!value || typeof value !== 'object') throw new ValidationError('Conteúdo inválido.');
  const input = value as Record<string, unknown>;
  const empty = input.empty && (input.empty as Record<string, unknown>).pt
    ? localized(input.empty, 'Aviso de prateleira vazia', 300, false)
    : undefined;
  return {
    id: typeof input.id === 'string' && input.id ? slugify(input.id, 'Identificador') : undefined,
    name: localized(input.name, 'Nome da prateleira', 120),
    accent: hex(input.accent, 'Cor', '#ff6b4a'),
    empty,
    visible: input.visible !== false,
  };
}
