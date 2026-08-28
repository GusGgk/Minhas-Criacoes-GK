import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/db/bootstrap';
import { getDb } from '@/db/index';
import { mediaAssets } from '@/db/schema';
import { getAdminApiAccess } from '@/lib/auth/admin';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const maxBytes = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') {
    const code = access.status === 'unauthenticated' ? 401 : access.status === 'unconfigured' ? 503 : 403;
    return NextResponse.json({ error: access.status }, { status: code });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Selecione uma imagem.' }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: 'Use JPEG, PNG, WebP ou AVIF.' }, { status: 415 });
  if (file.size <= 0 || file.size > maxBytes) return NextResponse.json({ error: 'A imagem precisa ter no máximo 8 MB.' }, { status: 413 });

  const cleanName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(-90) || 'imagem';
  const id = crypto.randomUUID();
  const pathname = `uploads/${new Date().getUTCFullYear()}/${id}-${cleanName}`;
  const blob = await put(pathname, file, {
    access: 'public',
    contentType: file.type,
    cacheControlMaxAge: 31536000,
  });

  await ensureDatabase();
  await getDb().insert(mediaAssets).values({
    id,
    storageKey: blob.pathname,
    url: blob.url,
    filename: file.name,
    contentType: file.type,
    size: file.size,
    createdAt: Date.now(),
  });

  return NextResponse.json({ id, url: blob.url }, { status: 201 });
}
