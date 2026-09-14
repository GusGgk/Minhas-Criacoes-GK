import { del, head } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/db/bootstrap';
import { getDb } from '@/db/index';
import { mediaAssets } from '@/db/schema';
import { getAdminApiAccess } from '@/lib/auth/admin';
import { STORAGE_OFF, blobAuth, storageReady } from '@/lib/storage';

/**
 * Records a file the browser uploaded straight to the blob store.
 *
 * The client tells us the URL, so we do not take its word for it: head() asks
 * the store itself for the size and content type. A URL that is not really
 * there, or not really ours, never reaches the table.
 */
export async function POST(request: Request) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') {
    const code = access.status === 'unauthenticated' ? 401 : access.status === 'unconfigured' ? 503 : 403;
    return NextResponse.json({ error: access.status }, { status: code });
  }
  if (!storageReady()) return NextResponse.json({ error: STORAGE_OFF }, { status: 503 });

  const body = await request.json() as { url?: unknown; filename?: unknown };
  const url = typeof body.url === 'string' ? body.url : '';
  if (!url) return NextResponse.json({ error: 'Informe o endereço do arquivo.' }, { status: 400 });

  let blob: Awaited<ReturnType<typeof head>>;
  try {
    blob = await head(url, blobAuth());
  } catch {
    return NextResponse.json({ error: 'Esse arquivo não foi encontrado no armazenamento.' }, { status: 404 });
  }

  // A private store answers with a private URL, which the public site could
  // never display. Better to refuse now, with the fix named, than to publish
  // a creation whose cover 403s for every visitor.
  if (/\.private\.blob\.vercel-storage\.com/.test(blob.url)) {
    await del(blob.url, blobAuth()).catch(() => undefined);
    return NextResponse.json(
      { error: 'O Blob store deste projeto é privado, e o site precisa de arquivos públicos. Crie um store novo como Public em Storage e conecte-o ao projeto.' },
      { status: 422 },
    );
  }

  await ensureDatabase();
  const id = crypto.randomUUID();
  await getDb().insert(mediaAssets).values({
    id,
    storageKey: blob.pathname,
    url: blob.url,
    filename: typeof body.filename === 'string' && body.filename ? body.filename : blob.pathname,
    contentType: blob.contentType ?? 'application/octet-stream',
    size: blob.size,
    createdAt: Date.now(),
  });

  return NextResponse.json({ id, url: blob.url }, { status: 201 });
}
