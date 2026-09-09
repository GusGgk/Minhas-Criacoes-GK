'use client';

/* eslint-disable @next/next/no-img-element -- library thumbnails point at arbitrary uploaded URLs. */

import { useCallback, useState } from 'react';

type Asset = {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: number;
};

function readable(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Everything already uploaded, so a file can be used in a second creation
 * without sending it twice. Loads on first open rather than on page load.
 */
export function MediaLibrary() {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/media');
      const body = await response.json() as { assets?: Asset[]; error?: string };
      if (!response.ok) throw new Error(body.error ?? 'Não foi possível carregar.');
      setAssets(body.assets ?? []);
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Erro ao carregar.');
      setAssets([]);
    }
  }, []);

  // Fetched when the panel is opened rather than from an effect: the open is
  // the event, and an effect here would just cascade renders.
  const toggle = () => {
    setOpen((wasOpen) => {
      if (!wasOpen && assets === null) void load();
      return !wasOpen;
    });
  };

  const copy = async (asset: Asset) => {
    try {
      await navigator.clipboard.writeText(asset.url);
      setNote(`Endereço de ${asset.filename} copiado. Cole no campo do arquivo.`);
    } catch {
      setNote('O navegador não deixou copiar. Selecione o endereço manualmente.');
    }
  };

  const remove = async (asset: Asset) => {
    if (!window.confirm(`Apagar ${asset.filename} de vez? Criações que usam este arquivo ficam sem ele.`)) return;
    try {
      const response = await fetch(`/api/admin/media/${asset.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Não foi possível apagar.');
      setAssets((current) => (current ?? []).filter((entry) => entry.id !== asset.id));
      setNote(`${asset.filename} apagado.`);
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Erro ao apagar.');
    }
  };

  return (
    <section className="ml">
      <button type="button" className="ml__toggle" onClick={toggle} aria-expanded={open}>
        {open ? 'Fechar a biblioteca' : 'Abrir a biblioteca de arquivos'}
        {assets && <b>{assets.length}</b>}
      </button>

      {open && (
        <div className="ml__panel">
          {note && <p className="ml__note" role="status">{note}</p>}

          {assets === null && <p className="ab-hint">Carregando…</p>}
          {assets?.length === 0 && <p className="ab-hint">Nada enviado ainda. Os arquivos aparecem aqui conforme você sobe.</p>}

          <div className="ml__grid">
            {(assets ?? []).map((asset) => (
              <figure key={asset.id} className="ml__item">
                <div className="ml__thumb">
                  {asset.contentType.startsWith('video/')
                    ? <video src={asset.url} preload="metadata" muted />
                    : <img src={asset.url} alt="" />}
                </div>
                <figcaption>
                  <strong title={asset.filename}>{asset.filename}</strong>
                  <span>{readable(asset.size)}</span>
                </figcaption>
                <div className="ab-item-actions">
                  <button type="button" onClick={() => copy(asset)}>Copiar endereço</button>
                  <button type="button" className="danger" onClick={() => remove(asset)}>Apagar</button>
                </div>
              </figure>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
