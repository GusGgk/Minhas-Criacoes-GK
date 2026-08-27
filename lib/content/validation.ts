import type { Metric, Project } from './types';

export type EditableProject = Omit<Project, 'id' | 'position'> & { id?: string; position?: number };

export class ValidationError extends Error {}

function stringValue(value: unknown, field: string, max: number, required = true) {
  if (typeof value !== 'string') throw new ValidationError(`${field} precisa ser texto.`);
  const normalized = value.trim();
  if (required && !normalized) throw new ValidationError(`${field} é obrigatório.`);
  if (normalized.length > max) throw new ValidationError(`${field} ultrapassa ${max} caracteres.`);
  return normalized;
}

function safeUrl(value: unknown, field: string, required = false) {
  const url = stringValue(value ?? '', field, 1000, required);
  if (!url) return '';
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error();
    return parsed.toString();
  } catch {
    throw new ValidationError(`${field} precisa usar uma URL http(s) ou um caminho interno.`);
  }
}

function parseMetrics(value: unknown): Metric[] | undefined {
  if (value == null) return undefined;
  if (!Array.isArray(value)) throw new ValidationError('Métricas precisam ser uma lista.');
  if (value.length > 6) throw new ValidationError('Use no máximo 6 métricas.');
  return value.map((metric, index) => {
    if (!metric || typeof metric !== 'object') throw new ValidationError(`Métrica ${index + 1} inválida.`);
    const record = metric as Record<string, unknown>;
    const label = record.label as Record<string, unknown> | undefined;
    return {
      id: stringValue(record.id ?? `metric-${index + 1}`, 'ID da métrica', 80),
      value: stringValue(record.value, 'Valor da métrica', 30),
      label: {
        pt: stringValue(label?.pt, 'Rótulo PT da métrica', 80),
        en: stringValue(label?.en ?? label?.pt, 'Rótulo EN da métrica', 80),
      },
    };
  });
}

export function parseProjectInput(value: unknown): EditableProject {
  if (!value || typeof value !== 'object') throw new ValidationError('Conteúdo inválido.');
  const input = value as Record<string, unknown>;
  const title = input.title as Record<string, unknown> | undefined;
  const category = input.category as Record<string, unknown> | undefined;
  const summary = input.summary as Record<string, unknown> | undefined;
  const alt = input.alt as Record<string, unknown> | undefined;
  const kind = input.kind === 'highlight' ? 'highlight' : input.kind === 'project' ? 'project' : null;
  if (!kind) throw new ValidationError('Tipo precisa ser projeto ou destaque.');
  const accent = stringValue(input.accent, 'Cor', 7);
  if (!/^#[0-9a-f]{6}$/i.test(accent)) throw new ValidationError('Cor precisa estar no formato #RRGGBB.');
  const tags = Array.isArray(input.tags)
    ? input.tags.slice(0, 8).map((tag, index) => stringValue(tag, `Tag ${index + 1}`, 30))
    : [];

  return {
    id: typeof input.id === 'string' ? input.id : undefined,
    slug: stringValue(input.slug, 'Slug', 100).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, ''),
    kind,
    category: {
      pt: stringValue(category?.pt, 'Categoria PT', 100),
      en: stringValue(category?.en ?? category?.pt, 'Categoria EN', 100),
    },
    title: {
      pt: stringValue(title?.pt, 'Título PT', 160),
      en: stringValue(title?.en ?? title?.pt, 'Título EN', 160),
    },
    summary: {
      pt: stringValue(summary?.pt, 'Resumo PT', 1000),
      en: stringValue(summary?.en ?? summary?.pt, 'Resumo EN', 1000),
    },
    image: safeUrl(input.image, 'Imagem', true),
    alt: {
      pt: stringValue(alt?.pt, 'Texto alternativo PT', 220),
      en: stringValue(alt?.en ?? alt?.pt, 'Texto alternativo EN', 220),
    },
    accent,
    year: stringValue(input.year, 'Ano', 20),
    tags,
    href: safeUrl(input.href, 'Link') || undefined,
    featured: Boolean(input.featured || kind === 'highlight'),
    visible: input.visible !== false,
    metrics: parseMetrics(input.metrics),
    position: Number.isInteger(input.position) ? Math.max(0, Number(input.position)) : undefined,
  };
}
