import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { getAdminApiAccess } from '@/lib/auth/admin';
import { ensureDatabase } from '@/db/bootstrap';

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
  const key = `uploads/${new Date().getUTCFullYear()}/${id}-${cleanName}`;
  await env.FILES.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
    customMetadata: { originalName: file.name },
  });
  await ensureDatabase();
  await env.DB.prepare('INSERT INTO media_assets (id, storage_key, filename, content_type, size, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, key, file.name, file.type, file.size, Date.now()).run();

  return NextResponse.json({ id, url: `/api/media/${key}` }, { status: 201 });
}
