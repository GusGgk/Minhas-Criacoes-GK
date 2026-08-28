import { NextResponse } from 'next/server';
import { getAdminApiAccess } from '@/lib/auth/admin';
import { deleteProject, updateProject } from '@/lib/content/repository';
import { parseProjectInput, ValidationError } from '@/lib/content/validation';

type Context = { params: Promise<{ id: string }> };

function denied(status: string) {
  const code = status === 'unauthenticated' ? 401 : status === 'unconfigured' ? 503 : 403;
  return NextResponse.json({ error: status }, { status: code });
}

export async function PATCH(request: Request, context: Context) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);
  const { id } = await context.params;
  try {
    const input = parseProjectInput(await request.json());
    return NextResponse.json({ item: await updateProject(id, input) });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (String(error).includes('NOT_FOUND')) return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
    if (/UNIQUE|duplicate key/i.test(String(error))) return NextResponse.json({ error: 'Este slug já está em uso.' }, { status: 409 });
    throw error;
  }
}

export async function DELETE(_request: Request, context: Context) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);
  const { id } = await context.params;
  try {
    await deleteProject(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (String(error).includes('NOT_FOUND')) return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
    throw error;
  }
}
