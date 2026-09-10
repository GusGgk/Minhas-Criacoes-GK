import { NextResponse } from 'next/server';
import { getAdminApiAccess } from '@/lib/auth/admin';
import { reorderCategories } from '@/lib/content/repository';

function denied(status: string) {
  const code = status === 'unauthenticated' ? 401 : status === 'unconfigured' ? 503 : 403;
  return NextResponse.json({ error: status }, { status: code });
}

export async function POST(request: Request) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);

  const body = await request.json() as { ids?: unknown };
  const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === 'string') : [];
  if (ids.length === 0) return NextResponse.json({ error: 'Envie a nova ordem.' }, { status: 400 });

  await reorderCategories(ids);
  return NextResponse.json({ ok: true });
}
