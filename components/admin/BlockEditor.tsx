'use client';

/* eslint-disable @next/next/no-img-element -- admin previews point at arbitrary uploaded URLs. */

import { embedUrl } from '@/lib/content/embed';
import type { ChapterBlock, GalleryImage, LocalizedText } from '@/lib/content/types';

export type BlockKind = ChapterBlock['kind'];

export const BLOCK_LABELS: Record<BlockKind, string> = {
  gallery: 'Galeria de imagens',
  stats: 'Números',
  quote: 'Citação',
  entries: 'Lista de entradas',
  swatches: 'Paleta de cores',
  chips: 'Etiquetas',
  video: 'Vídeo',
};

const empty = (): LocalizedText => ({ pt: '', en: '' });
const rid = () => Math.random().toString(36).slice(2, 9);

/** A fresh block of the chosen kind, already valid enough to save. */
export function blankBlock(kind: BlockKind): ChapterBlock {
  const id = `${kind}-${rid()}`;
  switch (kind) {
    case 'gallery': return { kind, id, images: [{ id: rid(), src: '', caption: empty() }] };
    case 'stats': return { kind, id, metrics: [{ id: rid(), value: '', label: empty() }] };
    case 'quote': return { kind, id, text: empty() };
    case 'entries': return { kind, id, entries: [{ id: rid(), title: empty(), meta: empty(), body: empty() }] };
    case 'swatches': return { kind, id, colors: [{ id: rid(), name: '', hex: '#304fec', text: '#ffffff' }] };
    case 'chips': return { kind, id, items: [empty()] };
    case 'video': return { kind, id, clip: { src: '', caption: empty() } };
  }
}

function Pair({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  rows?: number;
}) {
  const Field = rows ? 'textarea' : 'input';
  return (
    <div className="ab-pair">
      <label>
        {label}
        <Field rows={rows} value={value.pt} onChange={(e) => onChange({ ...value, pt: e.target.value })} />
      </label>
      <label>
        <span className="ab-en">em inglês, opcional</span>
        <Field rows={rows} value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} />
      </label>
    </div>
  );
}

function ImageFields({
  image,
  onChange,
  onUpload,
  busy,
}: {
  image: GalleryImage;
  onChange: (next: GalleryImage) => void;
  onUpload: (file: File) => Promise<string | null>;
  busy: boolean;
}) {
  return (
    <div className="ab-image">
      <div className="ab-image__frame">
        {image.src
          ? <img src={image.src} alt="" style={image.fit === 'contain' ? { objectFit: 'contain' } : undefined} />
          : <span>sem arquivo</span>}
      </div>
      <div className="ab-image__fields">
        <label>
          Arquivo
          <input value={image.src} onChange={(e) => onChange({ ...image, src: e.target.value })} placeholder="/media/... ou https://..." />
        </label>
        <label className="ab-upload">
          {busy ? 'Enviando…' : 'Enviar arquivo'}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              const url = await onUpload(file);
              if (url) onChange({ ...image, src: url });
            }}
          />
        </label>
        <Pair label="Legenda" value={image.caption} onChange={(caption) => onChange({ ...image, caption })} />
        <div className="ab-row">
          <label>
            Enquadramento
            <select
              value={image.fit ?? 'cover'}
              onChange={(e) => onChange({ ...image, fit: e.target.value as GalleryImage['fit'] })}
            >
              <option value="cover">Preencher o quadro</option>
              <option value="contain">Caber inteira</option>
            </select>
          </label>
          <label>
            Fundo, quando cabe inteira
            <input
              type="color"
              value={image.background ?? '#161715'}
              onChange={(e) => onChange({ ...image, background: e.target.value })}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

/** Generic add / remove / reorder controls for the lists inside a block. */
function ListControls({ index, total, onMove, onRemove }: {
  index: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="ab-item-actions">
      <button type="button" aria-label="Subir" onClick={() => onMove(-1)} disabled={index === 0}>↑</button>
      <button type="button" aria-label="Descer" onClick={() => onMove(1)} disabled={index === total - 1}>↓</button>
      <button type="button" className="danger" onClick={onRemove} disabled={total === 1}>Remover</button>
    </div>
  );
}

export function BlockEditor({
  block,
  onChange,
  onUpload,
  onUploadVideo,
  busy,
}: {
  block: ChapterBlock;
  onChange: (next: ChapterBlock) => void;
  /** small files: straight through the server route */
  onUpload: (file: File) => Promise<string | null>;
  /** big files: browser to blob store, bypassing the request size limit */
  onUploadVideo?: (file: File) => Promise<string | null>;
  busy: boolean;
}) {
  /** Moves an item inside one of the block's lists. */
  function reorder<T>(items: T[], index: number, dir: -1 | 1): T[] {
    const target = index + dir;
    if (target < 0 || target >= items.length) return items;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  }

  // Decided by kind, not by whether the key happens to exist — a brand new
  // block has no label yet and still needs the field.
  const labelled = block.kind !== 'quote';
  const noted = block.kind === 'gallery' || block.kind === 'stats' || block.kind === 'video';

  return (
    <div className="ab-body">
      {labelled && (
        <Pair
          label="Título do bloco, opcional"
          value={(block as { label?: LocalizedText }).label ?? empty()}
          onChange={(label) => onChange({ ...block, label } as ChapterBlock)}
        />
      )}

      {noted && (
        <Pair
          label="Observação, opcional"
          value={(block as { note?: LocalizedText }).note ?? empty()}
          onChange={(note) => onChange({ ...block, note } as ChapterBlock)}
        />
      )}

      {block.kind === 'video' && (
        <div className="ab-item">
          <div className="ab-video">
            <div className="ab-video__frame">
              {!block.clip.src
                ? <span>sem vídeo</span>
                : embedUrl(block.clip.src)
                  ? <iframe src={embedUrl(block.clip.src)!} title="Prévia do vídeo" allowFullScreen />
                  : <video src={block.clip.src} poster={block.clip.poster} controls preload="metadata" />}
            </div>
            <div className="ab-image__fields">
              <label>
                Arquivo de vídeo ou link do YouTube
                <input
                  value={block.clip.src}
                  placeholder="https://youtu.be/... ou /media/..."
                  onChange={(e) => onChange({ ...block, clip: { ...block.clip, src: e.target.value } })}
                />
              </label>
              <label className="ab-upload">
                {busy ? 'Enviando…' : 'Enviar vídeo'}
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  disabled={busy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file || !onUploadVideo) return;
                    const url = await onUploadVideo(file);
                    if (url) onChange({ ...block, clip: { ...block.clip, src: url } });
                  }}
                />
              </label>
              <label>
                Imagem de capa, opcional
                <input
                  value={block.clip.poster ?? ''}
                  placeholder="mostrada antes de dar play"
                  onChange={(e) => onChange({ ...block, clip: { ...block.clip, poster: e.target.value || undefined } })}
                />
              </label>
              <label className="ab-upload">
                Enviar imagem de capa
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  disabled={busy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file) return;
                    const url = await onUpload(file);
                    if (url) onChange({ ...block, clip: { ...block.clip, poster: url } });
                  }}
                />
              </label>
              <Pair
                label="Legenda"
                value={block.clip.caption}
                onChange={(caption) => onChange({ ...block, clip: { ...block.clip, caption } })}
              />
            </div>
          </div>
        </div>
      )}

      {block.kind === 'gallery' && (
        <>
          {block.images.map((image, i) => (
            <div className="ab-item" key={image.id}>
              <div className="ab-item__head">
                <strong>Imagem {i + 1}</strong>
                <ListControls
                  index={i}
                  total={block.images.length}
                  onMove={(d) => onChange({ ...block, images: reorder(block.images, i, d) })}
                  onRemove={() => onChange({ ...block, images: block.images.filter((_, j) => j !== i) })}
                />
              </div>
              <ImageFields
                image={image}
                busy={busy}
                onUpload={onUpload}
                onChange={(next) => onChange({ ...block, images: block.images.map((img, j) => j === i ? next : img) })}
              />
            </div>
          ))}
          <button type="button" className="ab-add" onClick={() => onChange({ ...block, images: [...block.images, { id: rid(), src: '', caption: empty() }] })}>
            Adicionar imagem
          </button>
        </>
      )}

      {block.kind === 'stats' && (
        <>
          {block.metrics.map((metric, i) => (
            <div className="ab-item" key={metric.id}>
              <div className="ab-item__head">
                <strong>Número {i + 1}</strong>
                <ListControls
                  index={i}
                  total={block.metrics.length}
                  onMove={(d) => onChange({ ...block, metrics: reorder(block.metrics, i, d) })}
                  onRemove={() => onChange({ ...block, metrics: block.metrics.filter((_, j) => j !== i) })}
                />
              </div>
              <label>
                Valor, como aparece na tela
                <input
                  value={metric.value}
                  placeholder="26,6 mi"
                  onChange={(e) => onChange({ ...block, metrics: block.metrics.map((m, j) => j === i ? { ...m, value: e.target.value } : m) })}
                />
              </label>
              <Pair
                label="Do que é esse número"
                value={metric.label}
                onChange={(label) => onChange({ ...block, metrics: block.metrics.map((m, j) => j === i ? { ...m, label } : m) })}
              />
            </div>
          ))}
          <button type="button" className="ab-add" onClick={() => onChange({ ...block, metrics: [...block.metrics, { id: rid(), value: '', label: empty() }] })}>
            Adicionar número
          </button>
        </>
      )}

      {block.kind === 'quote' && (
        <>
          <Pair label="A frase" value={block.text} rows={3} onChange={(text) => onChange({ ...block, text })} />
          <Pair label="De quem é, opcional" value={block.source ?? empty()} onChange={(source) => onChange({ ...block, source })} />
        </>
      )}

      {block.kind === 'entries' && (
        <>
          {block.entries.map((entry, i) => (
            <div className="ab-item" key={entry.id}>
              <div className="ab-item__head">
                <strong>Entrada {i + 1}</strong>
                <ListControls
                  index={i}
                  total={block.entries.length}
                  onMove={(d) => onChange({ ...block, entries: reorder(block.entries, i, d) })}
                  onRemove={() => onChange({ ...block, entries: block.entries.filter((_, j) => j !== i) })}
                />
              </div>
              <Pair label="Título" value={entry.title} onChange={(title) => onChange({ ...block, entries: block.entries.map((en, j) => j === i ? { ...en, title } : en) })} />
              <Pair label="Detalhe ao lado" value={entry.meta} onChange={(meta) => onChange({ ...block, entries: block.entries.map((en, j) => j === i ? { ...en, meta } : en) })} />
              <Pair label="Texto" rows={3} value={entry.body} onChange={(body) => onChange({ ...block, entries: block.entries.map((en, j) => j === i ? { ...en, body } : en) })} />
              <label>
                Link, opcional
                <input
                  value={entry.href ?? ''}
                  placeholder="https://..."
                  onChange={(e) => onChange({ ...block, entries: block.entries.map((en, j) => j === i ? { ...en, href: e.target.value || undefined } : en) })}
                />
              </label>
              {entry.document
                ? (
                  <>
                    <ImageFields
                      image={entry.document}
                      busy={busy}
                      onUpload={onUpload}
                      onChange={(document) => onChange({ ...block, entries: block.entries.map((en, j) => j === i ? { ...en, document } : en) })}
                    />
                    <button type="button" className="ab-add danger" onClick={() => onChange({ ...block, entries: block.entries.map((en, j) => j === i ? { ...en, document: undefined } : en) })}>
                      Remover documento
                    </button>
                  </>
                )
                : (
                  <button type="button" className="ab-add" onClick={() => onChange({ ...block, entries: block.entries.map((en, j) => j === i ? { ...en, document: { id: rid(), src: '', caption: empty(), fit: 'contain' as const } } : en) })}>
                    Anexar um documento
                  </button>
                )}
            </div>
          ))}
          <button type="button" className="ab-add" onClick={() => onChange({ ...block, entries: [...block.entries, { id: rid(), title: empty(), meta: empty(), body: empty() }] })}>
            Adicionar entrada
          </button>
        </>
      )}

      {block.kind === 'swatches' && (
        <>
          <div className="ab-swatches">
            {block.colors.map((color, i) => (
              <div className="ab-swatch" key={color.id}>
                <input
                  type="color"
                  value={color.hex}
                  aria-label={`Cor ${i + 1}`}
                  onChange={(e) => onChange({ ...block, colors: block.colors.map((c, j) => j === i ? { ...c, hex: e.target.value } : c) })}
                />
                <input
                  value={color.name}
                  placeholder="Nome da cor"
                  onChange={(e) => onChange({ ...block, colors: block.colors.map((c, j) => j === i ? { ...c, name: e.target.value } : c) })}
                />
                <button type="button" className="danger" disabled={block.colors.length === 1} onClick={() => onChange({ ...block, colors: block.colors.filter((_, j) => j !== i) })}>
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="ab-add" onClick={() => onChange({ ...block, colors: [...block.colors, { id: rid(), name: '', hex: '#304fec', text: '#ffffff' }] })}>
            Adicionar cor
          </button>
        </>
      )}

      {block.kind === 'chips' && (
        <>
          {block.items.map((item, i) => (
            <div className="ab-item ab-item--tight" key={i}>
              <Pair
                label={`Etiqueta ${i + 1}`}
                value={item}
                onChange={(next) => onChange({ ...block, items: block.items.map((it, j) => j === i ? next : it) })}
              />
              <ListControls
                index={i}
                total={block.items.length}
                onMove={(d) => onChange({ ...block, items: reorder(block.items, i, d) })}
                onRemove={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
              />
            </div>
          ))}
          <button type="button" className="ab-add" onClick={() => onChange({ ...block, items: [...block.items, empty()] })}>
            Adicionar etiqueta
          </button>
        </>
      )}
    </div>
  );
}
