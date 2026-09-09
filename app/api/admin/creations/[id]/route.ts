import { NextResponse } from 'next/server';
import { getAdminApiAccess } from '@/lib/auth/admin';
import { deleteCreation, updateCreation } from '@/lib/content/repository';
import { parseCreationInput } from '@/lib/content/creation-validation';
import { ValidationError } from '@/lib/content/validation';

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
    const input = parseCreationInput(await request.json());
    return NextResponse.json({ creation: await updateCreation(id, input) });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (String(error).includes('NOT_FOUND')) return NextResponse.json({ error: 'Criação não encontrada.' }, { status: 404 });
    if (/unique|duplicate key/i.test(String(error))) {
      return NextResponse.json({ error: 'Já existe uma criação com esse endereço.' }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, context: Context) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);
  const { id } = await context.params;
  try {
    await deleteCreation(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (String(error).includes('NOT_FOUND')) return NextResponse.json({ error: 'Criação não encontrada.' }, { status: 404 });
    throw error;
  }
}
