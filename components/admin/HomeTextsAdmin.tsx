'use client';

import { useState } from 'react';
import type { SiteContent } from '@/lib/content/types';

type Hero = SiteContent['hero'];

/** The three lines above the wall, saved as one row in site_settings. */
export function HomeTextsAdmin({ initial }: { initial: Hero }) {
  const [open, setOpen] = useState(false);
  const [hero, setHero] = useState<Hero>(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const field = (key: keyof Hero, locale: 'pt' | 'en', value: string) =>
    setHero((current) => ({ ...current, [key]: { ...current[key], [locale]: value } }));

  const save = async () => {
    setBusy(true);
    setNote('');
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(hero),
      });
      const body = await response.json() as { hero?: Hero; error?: string };
      if (!response.ok || !body.hero) throw new Error(body.error ?? 'Não foi possível salvar.');
      setHero(body.hero);
      setNote('Textos da home publicados.');
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Erro ao salvar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="ml">
      <button type="button" className="ml__toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {open ? 'Fechar os textos da home' : 'Textos da home'}
      </button>

      {open && (
        <div className="ml__panel">
          {note && <p className="ml__note" role="status">{note}</p>}

          <div className="ab-item">
            <div className="ab-pair">
              <label>Linha de cima<input value={hero.eyebrow.pt} onChange={(e) => field('eyebrow', 'pt', e.target.value)} /></label>
              <label><span className="ab-en">em inglês, opcional</span><input value={hero.eyebrow.en} onChange={(e) => field('eyebrow', 'en', e.target.value)} /></label>
            </div>
            <div className="ab-pair">
              <label>Título<textarea rows={2} value={hero.title.pt} onChange={(e) => field('title', 'pt', e.target.value)} /></label>
              <label><span className="ab-en">em inglês, opcional</span><textarea rows={2} value={hero.title.en} onChange={(e) => field('title', 'en', e.target.value)} /></label>
            </div>
            <div className="ab-pair">
              <label>Texto de apresentação<textarea rows={5} value={hero.lead.pt} onChange={(e) => field('lead', 'pt', e.target.value)} /></label>
              <label><span className="ab-en">em inglês, opcional</span><textarea rows={5} value={hero.lead.en} onChange={(e) => field('lead', 'en', e.target.value)} /></label>
            </div>
            <button type="button" className="ab-add" disabled={busy} onClick={save}>
              {busy ? 'Salvando…' : 'Publicar textos'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
