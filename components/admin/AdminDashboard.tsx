'use client';

/* eslint-disable @next/next/no-img-element -- Administrative previews intentionally render arbitrary local/R2 image URLs. */

import { useMemo, useState, type FormEvent } from 'react';
import type { Metric, Project } from '@/lib/content/types';

const blankItem: Project = {
  id: '', slug: '', kind: 'project', position: 0, visible: true, featured: false,
  accent: '#ff6b4a', year: String(new Date().getFullYear()), tags: [],
  category: { pt: '', en: '' }, title: { pt: '', en: '' }, summary: { pt: '', en: '' },
  image: '', alt: { pt: '', en: '' },
};

export function AdminDashboard({ initialItems, userName, signOutPath }: { initialItems: Project[]; userName: string; signOutPath: string }) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState<Project>({ ...blankItem });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const editing = Boolean(draft.id);
  const sorted = useMemo(() => [...items].sort((a, b) => a.position - b.position), [items]);

  const setLocalized = (field: 'title' | 'category' | 'summary' | 'alt', locale: 'pt' | 'en', value: string) => {
    setDraft((current) => ({ ...current, [field]: { ...current[field], [locale]: value } }));
  };

  const setMetric = (index: number, field: 'value' | 'pt' | 'en', value: string) => {
    setDraft((current) => {
      const metrics: Metric[] = [...(current.metrics ?? [])];
      while (metrics.length <= index) metrics.push({ id: `metric-${metrics.length + 1}`, value: '', label: { pt: '', en: '' } });
      const metric = metrics[index];
      metrics[index] = field === 'value'
        ? { ...metric, value }
        : { ...metric, label: { ...metric.label, [field]: value } };
      return { ...current, metrics };
    });
  };

  const edit = (item: Project) => {
    setDraft(JSON.parse(JSON.stringify(item)) as Project);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => { setDraft({ ...blankItem, category: { ...blankItem.category }, title: { ...blankItem.title }, summary: { ...blankItem.summary }, alt: { ...blankItem.alt }, tags: [] }); setMessage(''); };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage('');
    try {
      const payload = { ...draft, metrics: draft.metrics?.filter((metric) => metric.value.trim() && metric.label.pt.trim()) };
      const response = await fetch(editing ? `/api/admin/items/${draft.id}` : '/api/admin/items', {
        method: editing ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
      });
      const body = await response.json() as { item?: Project; error?: string };
      if (!response.ok || !body.item) throw new Error(body.error ?? 'Não foi possível salvar.');
      setItems((current) => editing ? current.map((item) => item.id === body.item?.id ? body.item : item) : [...current, body.item!]);
      if (!editing) reset();
      setMessage(editing ? 'Alterações publicadas.' : 'Novo item publicado.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao salvar.'); }
    finally { setBusy(false); }
  };

  const remove = async (item: Project) => {
    if (!window.confirm(`Excluir “${item.title.pt}”? A imagem enviada não será apagada automaticamente.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/items/${item.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Não foi possível excluir.');
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (draft.id === item.id) reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao excluir.'); }
    finally { setBusy(false); }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[target]] = [next[target], next[index]];
    const normalized = next.map((item, position) => ({ ...item, position }));
    setItems(normalized);
    const response = await fetch('/api/admin/reorder', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids: normalized.map((item) => item.id) }) });
    if (!response.ok) { setItems(sorted); setMessage('Não foi possível alterar a ordem.'); }
  };

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true); setMessage('Enviando imagem…');
    const form = new FormData(); form.set('file', file);
    try {
      const response = await fetch('/api/admin/media', { method: 'POST', body: form });
      const body = await response.json() as { url?: string; error?: string };
      if (!response.ok || !body.url) throw new Error(body.error ?? 'Falha no envio.');
      setDraft((current) => ({ ...current, image: body.url! }));
      setMessage('Imagem pronta para usar. Salve o item para publicar.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro no envio.'); }
    finally { setBusy(false); }
  };

  return (
    <main className="admin-shell">
      <header className="admin-header"><div><span>GK / CMS</span><h1>Arquivo de criações</h1></div><div><p>{userName}</p><a href="/" target="_blank">Ver site ↗</a><a href={signOutPath}>Sair</a></div></header>
      <div className="admin-layout">
        <form className="admin-editor" onSubmit={save}>
          <div className="admin-editor__title"><div><span>{editing ? 'EDITANDO' : 'NOVO ITEM'}</span><h2>{editing ? draft.title.pt || 'Sem título' : 'Adicionar criação'}</h2></div>{editing && <button type="button" onClick={reset}>Cancelar</button>}</div>
          <div className="admin-row admin-row--three">
            <label>Tipo<select value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as Project['kind'], featured: event.target.value === 'highlight' })}><option value="project">Projeto</option><option value="highlight">Destaque</option></select></label>
            <label>Ano<input value={draft.year} onChange={(event) => setDraft({ ...draft, year: event.target.value })} /></label>
            <label>Cor<input type="color" value={draft.accent} onChange={(event) => setDraft({ ...draft, accent: event.target.value })} /></label>
          </div>
          <label>Slug<input required value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} placeholder="nome-do-projeto" /></label>
          <div className="admin-languages"><section><span>PORTUGUÊS</span><label>Título<input required value={draft.title.pt} onChange={(event) => setLocalized('title', 'pt', event.target.value)} /></label><label>Categoria<input required value={draft.category.pt} onChange={(event) => setLocalized('category', 'pt', event.target.value)} /></label><label>Resumo<textarea required rows={5} value={draft.summary.pt} onChange={(event) => setLocalized('summary', 'pt', event.target.value)} /></label><label>Texto alternativo<input required value={draft.alt.pt} onChange={(event) => setLocalized('alt', 'pt', event.target.value)} /></label></section><section><span>ENGLISH</span><label>Title<input value={draft.title.en} onChange={(event) => setLocalized('title', 'en', event.target.value)} /></label><label>Category<input value={draft.category.en} onChange={(event) => setLocalized('category', 'en', event.target.value)} /></label><label>Summary<textarea rows={5} value={draft.summary.en} onChange={(event) => setLocalized('summary', 'en', event.target.value)} /></label><label>Alt text<input value={draft.alt.en} onChange={(event) => setLocalized('alt', 'en', event.target.value)} /></label></section></div>
          <div className="admin-row"><label>Imagem / caminho<input required value={draft.image} onChange={(event) => setDraft({ ...draft, image: event.target.value })} placeholder="/api/media/..." /></label><label className="admin-upload">Enviar imagem<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(event) => upload(event.target.files?.[0])} /></label></div>
          <div className="admin-row"><label>Link externo<input value={draft.href ?? ''} onChange={(event) => setDraft({ ...draft, href: event.target.value || undefined })} placeholder="https://..." /></label><label>Tags, separadas por vírgula<input value={draft.tags.join(', ')} onChange={(event) => setDraft({ ...draft, tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} /></label></div>
          <section className="admin-metrics"><div><span>MÉTRICAS OPCIONAIS</span><p>Use para números, curiosidades ou pequenas histórias que ajudem a apresentar a criação.</p></div>{[0, 1, 2].map((index) => <div className="admin-metric-row" key={index}><label>Valor<input value={draft.metrics?.[index]?.value ?? ''} onChange={(event) => setMetric(index, 'value', event.target.value)} placeholder="25,1 mil" /></label><label>Rótulo PT<input value={draft.metrics?.[index]?.label.pt ?? ''} onChange={(event) => setMetric(index, 'pt', event.target.value)} placeholder="inscritos" /></label><label>Label EN<input value={draft.metrics?.[index]?.label.en ?? ''} onChange={(event) => setMetric(index, 'en', event.target.value)} placeholder="subscribers" /></label></div>)}</section>
          <div className="admin-checks"><label><input type="checkbox" checked={draft.visible} onChange={(event) => setDraft({ ...draft, visible: event.target.checked })} />Visível</label><label><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked, kind: event.target.checked ? 'highlight' : draft.kind })} />Destaque</label></div>
          {draft.image && <div className="admin-preview"><img src={draft.image} alt="Prévia do upload" /><span style={{ background: draft.accent }} /></div>}
          <div className="admin-submit"><button type="submit" disabled={busy}>{busy ? 'Salvando…' : editing ? 'Publicar alterações' : 'Adicionar ao arquivo'}</button><p role="status">{message}</p></div>
        </form>

        <aside className="admin-list"><div className="admin-list__head"><span>ITENS PUBLICÁVEIS</span><strong>{items.length}</strong></div>{sorted.map((item, index) => <article key={item.id} className={!item.visible ? 'is-hidden' : ''}><img src={item.image} alt="" /><div><span>{item.kind === 'highlight' ? 'DESTAQUE' : item.category.pt}</span><h3>{item.title.pt}</h3><p>{item.visible ? 'visível' : 'oculto'} · {item.year}</p></div><div className="admin-item-actions"><button type="button" aria-label="Subir" onClick={() => move(index, -1)} disabled={index === 0}>↑</button><button type="button" aria-label="Descer" onClick={() => move(index, 1)} disabled={index === sorted.length - 1}>↓</button><button type="button" onClick={() => edit(item)}>Editar</button><button type="button" className="danger" onClick={() => remove(item)}>Excluir</button></div></article>)}</aside>
      </div>
    </main>
  );
}
