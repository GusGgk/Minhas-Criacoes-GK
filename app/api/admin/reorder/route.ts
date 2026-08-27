import { NextResponse } from 'next/server';
import { getAdminApiAccess } from '@/lib/auth/admin';
import { reorderProjects } from '@/lib/content/repository';

export async function POST(request: Request) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') {
    const code = access.status === 'unauthenticated' ? 401 : access.status === 'unconfigured' ? 503 : 403;
    return NextResponse.json({ error: access.status }, { status: code });
  }
  const body = await request.json() as { ids?: unknown };
  if (!Array.isArray(body.ids) || body.ids.length > 100 || body.ids.some((id) => typeof id !== 'string')) {
    return NextResponse.json({ error: 'Ordem inválida.' }, { status: 400 });
  }
  await reorderProjects(body.ids as string[]);
  return NextResponse.json({ ok: true });
}
