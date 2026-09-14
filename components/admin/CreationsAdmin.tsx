'use client';

/* eslint-disable @next/next/no-img-element -- admin previews point at arbitrary uploaded URLs. */

import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { BLOCK_LABELS, BlockEditor, blankBlock, type BlockKind } from './BlockEditor';
import { MediaLibrary } from './MediaLibrary';
import { ShelvesAdmin } from './ShelvesAdmin';
import { HomeTextsAdmin } from './HomeTextsAdmin';
import type { Category, ChapterBlock, Creation, GalleryImage, LocalizedText, SiteContent } from '@/lib/content/types';

const STORAGE_OFF = 'Envio de arquivos desligado: nenhum Blob store ligado a este projeto na Vercel.';

/** The body of a failed response, if it is ours; a status-based line otherwise. */
async function readError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null) as { error?: string } | null;
  if (body?.error) return body.error;
  if (response.status === 401) return 'Sua sessão expirou. Recarregue a página e entre de novo.';
  if (response.status === 413) return 'Arquivo grande demais para o servidor.';
  return fallback;
}

/** The blob client hides why the token route said no, so name the likely reasons. */
function explainUpload(error: unknown) {
  const text = error instanceof Error ? error.message : '';
  if (/client token|presigned url/i.test(text)) {
    return 'O servidor não autorizou o envio. Recarregue a página — a sessão pode ter expirado — ou o armazenamento está desconectado.';
  }
  if (/private/i.test(text)) return 'O Blob store é privado; o site precisa de um store público. Crie um novo como Public em Storage.';
  if (/content.?type|not allowed/i.test(text)) return 'Tipo de arquivo não aceito. Use JPEG, PNG, WebP, AVIF ou MP4/WebM/MOV.';
  if (/size|too large|maximum/i.test(text)) return 'Arquivo grande demais: imagens até 12 MB, vídeos até 200 MB.';
  return text || 'Erro no envio.';
}

type Draft = Creation & { visible: boolean };
type Listed = Creation & { visible: boolean; position: number };

const SIGNATURES: { value: string; label: string }[] = [
  { value: '', label: 'Sem assinatura, entrada padrão' },
  { value: 'broadcast', label: 'Broadcast — números primeiro, identidade deslizando' },
  { value: 'palette', label: 'Paleta — as cores varrem a tela' },
  { value: 'deal', label: 'Baralho — imagens distribuídas como cartas' },
  { value: 'graph', label: 'Grafo — o desenho liga por último' },
  { value: 'reel', label: 'Rolo — fotos passando rápido' },
  { value: 'essay', label: 'Ensaio — a capa respira abrindo' },
  { value: 'dossier', label: 'Dossiê — documento puxado da gaveta' },
  { value: 'gift', label: 'Presente — tudo aquece devagar' },
  { value: 'arcade', label: 'Arcade — entra quicando' },
];

const empty = (): LocalizedText => ({ pt: '', en: '' });

function blankDraft(categoryId: string): Draft {
  return {
    id: '', slug: '', categoryId,
    name: empty(), tagline: empty(), year: empty(),
    body: [empty()], blocks: [], visible: true,
  };
}

export function CreationsAdmin({
  initialCreations,
  initialCategories,
  initialHero,
  storageReady,
  userName,
  signOutPath,
}: {
  initialCreations: Listed[];
  initialCategories: (Category & { visible: boolean; position: number })[];
  initialHero: SiteContent['hero'];
  /** false when BLOB_READ_WRITE_TOKEN is missing: uploads are off, everything else works */
  storageReady: boolean;
  userName: string;
  signOutPath: string;
}) {
  const [items, setItems] = useState(initialCreations);
  const [categories, setCategories] = useState(initialCategories);
  const [draft, setDraft] = useState<Draft>(() => blankDraft(initialCategories[0]?.id ?? ''));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const editing = Boolean(draft.id);

  const sorted = useMemo(() => [...items].sort((a, b) => a.position - b.position), [items]);
  const shelfName = (id: string) => categories.find((c) => c.id === id)?.name.pt ?? id;

  /**
   * Every file goes browser → blob store directly, then we record the row.
   * A server route would cap the body at ~4.5 MB on Vercel, which a phone
   * photo passes; this path never sends the bytes through us. The folder in
   * the pathname tells the token route what to allow.
   */
  const send = useCallback(async (file: File, folder: 'uploads' | 'videos'): Promise<string | null> => {
    if (!storageReady) {
      setMessage(STORAGE_OFF);
      return null;
    }
    setBusy(true);
    setMessage(folder === 'videos' ? `Enviando ${file.name}… vídeos grandes demoram.` : `Enviando ${file.name}…`);
    try {
      const { uploadPresigned } = await import('@vercel/blob/client');
      const clean = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(-90) || 'arquivo';
      const pathname = folder === 'videos' ? `videos/${clean}` : `uploads/${new Date().getUTCFullYear()}/${clean}`;
      const blob = await uploadPresigned(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/media/client-upload',
        contentType: file.type,
      });
      const response = await fetch('/api/admin/media/record', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: blob.url, filename: file.name }),
      });
      if (!response.ok) throw new Error(await readError(response, 'O arquivo subiu, mas não ficou registrado.'));
      setMessage(`${file.name} enviado. Salve a criação para publicar.`);
      return blob.url;
    } catch (error) {
      setMessage(explainUpload(error));
      return null;
    } finally {
      setBusy(false);
    }
  }, [storageReady]);

  const upload = useCallback((file: File) => send(file, 'uploads'), [send]);
  const uploadVideo = useCallback((file: File) => send(file, 'videos'), [send]);

  const setBlock = (index: number, next: ChapterBlock) =>
    setDraft((d) => ({ ...d, blocks: d.blocks.map((b, i) => i === index ? next : b) }));

  const moveBlock = (index: number, dir: -1 | 1) => setDraft((d) => {
    const target = index + dir;
    if (target < 0 || target >= d.blocks.length) return d;
    const blocks = [...d.blocks];
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    return { ...d, blocks };
  });

  const edit = (item: Listed) => {
    setDraft(structuredClone(item));
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setDraft(blankDraft(categories[0]?.id ?? ''));
    setMessage('');
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(editing ? `/api/admin/creations/${draft.id}` : '/api/admin/creations', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const body = await response.json() as { creation?: Creation; error?: string };
      if (!response.ok || !body.creation) throw new Error(body.error ?? 'Não foi possível salvar.');
      const saved = body.creation;
      setItems((current) => editing
        ? current.map((item) => item.id === saved.id ? { ...item, ...saved, visible: draft.visible } : item)
        : [...current, { ...saved, visible: draft.visible, position: current.length }]);
      if (!editing) reset();
      setMessage(editing ? 'Alterações publicadas.' : 'Criação adicionada.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao salvar.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: Listed) => {
    if (!window.confirm(`Excluir “${item.name.pt}”? Os arquivos enviados continuam guardados.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/creations/${item.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Não foi possível excluir.');
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (draft.id === item.id) reset();
      setMessage('Criação removida.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao excluir.');
    } finally {
      setBusy(false);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[target]] = [next[target], next[index]];
    const normalized = next.map((item, position) => ({ ...item, position }));
    const previous = sorted;
    setItems(normalized);
    const response = await fetch('/api/admin/creations/reorder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids: normalized.map((item) => item.id) }),
    });
    if (!response.ok) {
      setItems(previous);
      setMessage('Não foi possível alterar a ordem.');
    }
  };

  const cover: GalleryImage = draft.cover ?? { id: 'cover', src: '', caption: empty() };

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div><span>GK / CMS</span><h1>Minhas criações</h1></div>
        <div><p>{userName}</p><a href="/" target="_blank">Ver site ↗</a><a href={signOutPath}>Sair</a></div>
      </header>

      {!storageReady && (
        <p className="admin-warn" role="alert">
          <strong>Envio de arquivos desligado.</strong> Nenhum Blob store está ligado a este projeto na Vercel: em
          <em>Storage</em>, crie um store <em>Public</em> (ou abra o existente), conecte-o a este projeto e faça Redeploy.
          Textos, prateleiras e endereços colados à mão continuam funcionando.
        </p>
      )}

      <div className="admin-layout">
        <form className="admin-editor" onSubmit={save}>
          <div className="admin-editor__title">
            <div>
              <span>{editing ? 'EDITANDO' : 'NOVA CRIAÇÃO'}</span>
              <h2>{editing ? draft.name.pt || 'Sem nome' : 'Adicionar à parede'}</h2>
            </div>
            {editing && <button type="button" onClick={reset}>Cancelar</button>}
          </div>

          <div className="admin-row">
            <label>
              Prateleira
              <select value={draft.categoryId} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name.pt}</option>)}
              </select>
            </label>
            <label>
              Endereço na URL
              <input required value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="canal-decisao" />
            </label>
          </div>

          <div className="admin-languages">
            <section>
              <span>PORTUGUÊS</span>
              <label>Nome<input required value={draft.name.pt} onChange={(e) => setDraft({ ...draft, name: { ...draft.name, pt: e.target.value } })} /></label>
              <label>Frase de apresentação<textarea rows={2} value={draft.tagline.pt} onChange={(e) => setDraft({ ...draft, tagline: { ...draft.tagline, pt: e.target.value } })} /></label>
              <label>Quando<input value={draft.year.pt} onChange={(e) => setDraft({ ...draft, year: { ...draft.year, pt: e.target.value } })} placeholder="desde 2023" /></label>
            </section>
            <section>
              <span>ENGLISH</span>
              <label>Name<input value={draft.name.en} onChange={(e) => setDraft({ ...draft, name: { ...draft.name, en: e.target.value } })} /></label>
              <label>Tagline<textarea rows={2} value={draft.tagline.en} onChange={(e) => setDraft({ ...draft, tagline: { ...draft.tagline, en: e.target.value } })} /></label>
              <label>When<input value={draft.year.en} onChange={(e) => setDraft({ ...draft, year: { ...draft.year, en: e.target.value } })} /></label>
            </section>
          </div>

          <fieldset className="ab-group">
            <legend>Capa</legend>
            <div className="ab-image">
              <div className="ab-image__frame">
                {cover.src ? <img src={cover.src} alt="" style={cover.fit === 'contain' ? { objectFit: 'contain' } : undefined} /> : <span>sem capa</span>}
              </div>
              <div className="ab-image__fields">
                <label>
                  Arquivo
                  <input value={cover.src} onChange={(e) => setDraft({ ...draft, cover: { ...cover, src: e.target.value } })} placeholder="/media/... ou https://..." />
                </label>
                <label className="ab-upload">
                  {busy ? 'Enviando…' : 'Enviar arquivo'}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" disabled={busy}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      const url = await upload(file);
                      if (url) setDraft((d) => ({ ...d, cover: { ...(d.cover ?? cover), src: url } }));
                    }} />
                </label>
                <div className="ab-pair">
                  <label>Legenda<input value={cover.caption.pt} onChange={(e) => setDraft({ ...draft, cover: { ...cover, caption: { ...cover.caption, pt: e.target.value } } })} /></label>
                  <label><span className="ab-en">em inglês, opcional</span><input value={cover.caption.en} onChange={(e) => setDraft({ ...draft, cover: { ...cover, caption: { ...cover.caption, en: e.target.value } } })} /></label>
                </div>
                <label>
                  Enquadramento
                  <select value={cover.fit ?? 'cover'} onChange={(e) => setDraft({ ...draft, cover: { ...cover, fit: e.target.value as GalleryImage['fit'] } })}>
                    <option value="cover">Preencher o quadro</option>
                    <option value="contain">Caber inteira</option>
                  </select>
                </label>
                {draft.cover && <button type="button" className="ab-add danger" onClick={() => setDraft({ ...draft, cover: undefined })}>Remover capa</button>}
              </div>
            </div>
          </fieldset>

          <fieldset className="ab-group">
            <legend>Texto</legend>
            {draft.body.map((paragraph, i) => (
              <div className="ab-item ab-item--tight" key={i}>
                <div className="ab-pair">
                  <label>Parágrafo {i + 1}<textarea rows={3} value={paragraph.pt} onChange={(e) => setDraft({ ...draft, body: draft.body.map((p, j) => j === i ? { ...p, pt: e.target.value } : p) })} /></label>
                  <label><span className="ab-en">em inglês, opcional</span><textarea rows={3} value={paragraph.en} onChange={(e) => setDraft({ ...draft, body: draft.body.map((p, j) => j === i ? { ...p, en: e.target.value } : p) })} /></label>
                </div>
                <div className="ab-item-actions">
                  <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => setDraft((d) => { const body = [...d.body]; [body[i - 1], body[i]] = [body[i], body[i - 1]]; return { ...d, body }; })}>↑</button>
                  <button type="button" aria-label="Descer" disabled={i === draft.body.length - 1} onClick={() => setDraft((d) => { const body = [...d.body]; [body[i + 1], body[i]] = [body[i], body[i + 1]]; return { ...d, body }; })}>↓</button>
                  <button type="button" className="danger" disabled={draft.body.length === 1} onClick={() => setDraft({ ...draft, body: draft.body.filter((_, j) => j !== i) })}>Remover</button>
                </div>
              </div>
            ))}
            <button type="button" className="ab-add" onClick={() => setDraft({ ...draft, body: [...draft.body, empty()] })}>Adicionar parágrafo</button>
          </fieldset>

          <fieldset className="ab-group">
            <legend>Blocos</legend>
            {draft.blocks.length === 0 && <p className="ab-hint">Nenhum bloco ainda. Eles são as partes visuais da página: galeria, números, citação, paleta.</p>}
            {draft.blocks.map((block, i) => (
              <div className="ab-block" key={block.id}>
                <div className="ab-block__head">
                  <strong>{BLOCK_LABELS[block.kind]}</strong>
                  <div className="ab-item-actions">
                    <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => moveBlock(i, -1)}>↑</button>
                    <button type="button" aria-label="Descer" disabled={i === draft.blocks.length - 1} onClick={() => moveBlock(i, 1)}>↓</button>
                    <button type="button" className="danger" onClick={() => setDraft({ ...draft, blocks: draft.blocks.filter((_, j) => j !== i) })}>Remover bloco</button>
                  </div>
                </div>
                <BlockEditor block={block} busy={busy} onUpload={upload} onUploadVideo={uploadVideo} onChange={(next) => setBlock(i, next)} />
              </div>
            ))}
            <div className="ab-addrow">
              {(Object.keys(BLOCK_LABELS) as BlockKind[]).map((kind) => (
                <button type="button" key={kind} className="ab-add" onClick={() => setDraft({ ...draft, blocks: [...draft.blocks, blankBlock(kind)] })}>
                  + {BLOCK_LABELS[kind]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="ab-group">
            <legend>Acabamento</legend>
            <label>
              Como a página entra
              <select value={draft.signature ?? ''} onChange={(e) => setDraft({ ...draft, signature: (e.target.value || undefined) as Creation['signature'] })}>
                {SIGNATURES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <div className="admin-row">
              <label>Link, opcional<input value={draft.link?.href ?? ''} placeholder="https://..." onChange={(e) => setDraft({ ...draft, link: e.target.value ? { href: e.target.value, label: draft.link?.label ?? empty() } : undefined })} /></label>
              <label>Texto do botão<input value={draft.link?.label.pt ?? ''} placeholder="Abrir o canal" disabled={!draft.link} onChange={(e) => setDraft({ ...draft, link: draft.link ? { ...draft.link, label: { ...draft.link.label, pt: e.target.value } } : undefined })} /></label>
            </div>
            <div className="ab-pair">
              <label>Nota de rodapé, opcional<input value={draft.footnote?.pt ?? ''} onChange={(e) => setDraft({ ...draft, footnote: e.target.value ? { pt: e.target.value, en: draft.footnote?.en ?? '' } : undefined })} /></label>
              <label><span className="ab-en">em inglês, opcional</span><input value={draft.footnote?.en ?? ''} disabled={!draft.footnote} onChange={(e) => setDraft({ ...draft, footnote: draft.footnote ? { ...draft.footnote, en: e.target.value } : undefined })} /></label>
            </div>
            <div className="admin-checks">
              <label><input type="checkbox" checked={draft.visible} onChange={(e) => setDraft({ ...draft, visible: e.target.checked })} />Visível na parede</label>
              <label><input type="checkbox" checked={draft.visual === 'constellation'} onChange={(e) => setDraft({ ...draft, visual: e.target.checked ? 'constellation' : undefined })} />Mostrar o desenho de constelação</label>
            </div>
          </fieldset>

          <div className="admin-submit">
            <button type="submit" disabled={busy}>{busy ? 'Salvando…' : editing ? 'Publicar alterações' : 'Adicionar à parede'}</button>
          </div>
          {message && <p className="admin-toast" role="status">{message}</p>}
        </form>

        <aside className="admin-list">
          <HomeTextsAdmin initial={initialHero} />
          <ShelvesAdmin initial={initialCategories} onChanged={setCategories} />
          <MediaLibrary />
          <div className="admin-list__head"><span>NA PAREDE</span><strong>{items.length}</strong></div>
          {sorted.map((item, index) => (
            <article key={item.id} className={item.visible ? '' : 'is-hidden'}>
              {item.cover?.src
                ? <img src={item.cover.src} alt="" />
                : <div className="admin-list__blank" aria-hidden="true" />}
              <div>
                <span>{shelfName(item.categoryId)}</span>
                <h3>{item.name.pt}</h3>
                <p>{item.visible ? 'visível' : 'oculta'} · {item.blocks.length} bloco{item.blocks.length === 1 ? '' : 's'}</p>
              </div>
              <div className="admin-item-actions">
                <button type="button" aria-label="Subir" onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
                <button type="button" aria-label="Descer" onClick={() => move(index, 1)} disabled={index === sorted.length - 1}>↓</button>
                <button type="button" onClick={() => edit(item)}>Editar</button>
                <button type="button" className="danger" onClick={() => remove(item)}>Excluir</button>
              </div>
            </article>
          ))}
        </aside>
      </div>
    </main>
  );
}
