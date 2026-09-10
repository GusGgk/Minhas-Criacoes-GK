'use client';

import { useState } from 'react';
import type { Category, LocalizedText } from '@/lib/content/types';

type Shelf = Category & { visible: boolean; position: number };

const empty = (): LocalizedText => ({ pt: '', en: '' });
const blank = (): Shelf => ({
  id: '', name: empty(), accent: '#ff6b4a', visible: true, position: 0,
});

/**
 * Shelves are the wall's structure, so this stays a small list rather than a
 * full form: name, colour, the line shown while it is empty, and order.
 */
export function ShelvesAdmin({
  initial,
  onChanged,
}: {
  initial: Shelf[];
  onChanged: (shelves: Shelf[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [shelves, setShelves] = useState(initial);
  const [draft, setDraft] = useState<Shelf>(blank());
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const editing = Boolean(draft.id) && shelves.some((s) => s.id === draft.id);

  const publish = (next: Shelf[]) => {
    setShelves(next);
    onChanged(next);
  };

  const save = async () => {
    setBusy(true);
    setNote('');
    try {
      const response = await fetch(editing ? `/api/admin/categories/${draft.id}` : '/api/admin/categories', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const body = await response.json() as { category?: Category; error?: string };
      if (!response.ok || !body.category) throw new Error(body.error ?? 'Não foi possível salvar.');
      const saved = { ...body.category, visible: draft.visible, position: draft.position };
      publish(editing
        ? shelves.map((s) => s.id === saved.id ? saved : s)
        : [...shelves, { ...saved, position: shelves.length }]);
      setDraft(blank());
      setNote(editing ? 'Prateleira atualizada.' : 'Prateleira criada.');
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Erro ao salvar.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (shelf: Shelf) => {
    if (!window.confirm(`Apagar a prateleira “${shelf.name.pt}”?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/categories/${shelf.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? 'Não foi possível apagar.');
      }
      publish(shelves.filter((s) => s.id !== shelf.id));
      setNote('Prateleira apagada.');
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Erro ao apagar.');
    } finally {
      setBusy(false);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= shelves.length) return;
    const next = [...shelves];
    [next[index], next[target]] = [next[target], next[index]];
    const normalized = next.map((s, position) => ({ ...s, position }));
    const previous = shelves;
    publish(normalized);
    const response = await fetch('/api/admin/categories/reorder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids: normalized.map((s) => s.id) }),
    });
    if (!response.ok) {
      publish(previous);
      setNote('Não foi possível alterar a ordem.');
    }
  };

  return (
    <section className="ml">
      <button type="button" className="ml__toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {open ? 'Fechar as prateleiras' : 'Prateleiras da parede'}
        <b>{shelves.length}</b>
      </button>

      {open && (
        <div className="ml__panel">
          {note && <p className="ml__note" role="status">{note}</p>}

          <ul className="sh__list">
            {shelves.map((shelf, index) => (
              <li key={shelf.id} className={shelf.visible ? '' : 'is-hidden'}>
                <i aria-hidden="true" style={{ background: shelf.accent }} />
                <span>{shelf.name.pt}</span>
                <div className="ab-item-actions">
                  <button type="button" aria-label="Subir" onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
                  <button type="button" aria-label="Descer" onClick={() => move(index, 1)} disabled={index === shelves.length - 1}>↓</button>
                  <button type="button" onClick={() => { setDraft(structuredClone(shelf)); setNote(''); }}>Editar</button>
                  <button type="button" className="danger" onClick={() => remove(shelf)}>Apagar</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="ab-item">
            <div className="ab-item__head">
              <strong>{editing ? `Editando ${draft.name.pt || 'prateleira'}` : 'Nova prateleira'}</strong>
              {editing && <button type="button" className="ab-add" onClick={() => setDraft(blank())}>Cancelar</button>}
            </div>

            {!editing && (
              <label>
                Identificador, usado internamente
                <input
                  value={draft.id}
                  placeholder="pinturas"
                  onChange={(e) => setDraft({ ...draft, id: e.target.value })}
                />
              </label>
            )}

            <div className="ab-pair">
              <label>Nome<input value={draft.name.pt} onChange={(e) => setDraft({ ...draft, name: { ...draft.name, pt: e.target.value } })} /></label>
              <label><span className="ab-en">em inglês, opcional</span><input value={draft.name.en} onChange={(e) => setDraft({ ...draft, name: { ...draft.name, en: e.target.value } })} /></label>
            </div>

            <div className="ab-row">
              <label>
                Cor da prateleira
                <input type="color" value={draft.accent} onChange={(e) => setDraft({ ...draft, accent: e.target.value })} />
              </label>
              <label className="admin-checks">
                <input type="checkbox" checked={draft.visible} onChange={(e) => setDraft({ ...draft, visible: e.target.checked })} />
                Visível na parede
              </label>
            </div>

            <div className="ab-pair">
              <label>
                O que aparece enquanto ela está vazia
                <input
                  value={draft.empty?.pt ?? ''}
                  placeholder="Prateleira montada, ainda sem nada."
                  onChange={(e) => setDraft({ ...draft, empty: e.target.value ? { pt: e.target.value, en: draft.empty?.en ?? '' } : undefined })}
                />
              </label>
              <label>
                <span className="ab-en">em inglês, opcional</span>
                <input
                  value={draft.empty?.en ?? ''}
                  disabled={!draft.empty}
                  onChange={(e) => setDraft({ ...draft, empty: draft.empty ? { ...draft.empty, en: e.target.value } : undefined })}
                />
              </label>
            </div>

            <button type="button" className="ab-add" disabled={busy} onClick={save}>
              {busy ? 'Salvando…' : editing ? 'Salvar prateleira' : 'Criar prateleira'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
