import { del } from '@vercel/blob';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/db/bootstrap';
import { getDb } from '@/db/index';
import { mediaAssets } from '@/db/schema';
import { getAdminApiAccess } from '@/lib/auth/admin';
import { blobAuth } from '@/lib/storage';

type Context = { params: Promise<{ id: string }> };

/**
 * Removes a file for good. Nothing checks whether a creation still points at
 * it — the panel warns before calling this, and the row is gone either way, so
 * the delete is deliberate rather than cascading.
 */
export async function DELETE(_request: Request, context: Context) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') {
    const code = access.status === 'unauthenticated' ? 401 : access.status === 'unconfigured' ? 503 : 403;
    return NextResponse.json({ error: access.status }, { status: code });
  }

  const { id } = await context.params;
  await ensureDatabase();
  const db = getDb();

  const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
  if (!asset) return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });

  // Drop the row even if the store already lost the file, so the library does
  // not keep listing something that cannot be shown.
  try {
    await del(asset.url, blobAuth());
  } catch (error) {
    console.warn('Blob já não estava lá:', error);
  }

  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  return new NextResponse(null, { status: 204 });
}
