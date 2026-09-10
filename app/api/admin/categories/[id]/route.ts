import { NextResponse } from 'next/server';
import { getAdminApiAccess } from '@/lib/auth/admin';
import { deleteCategory, updateCategory } from '@/lib/content/repository';
import { parseCategoryInput } from '@/lib/content/creation-validation';
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
    const input = parseCategoryInput(await request.json());
    return NextResponse.json({ category: await updateCategory(id, input) });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (String(error).includes('NOT_FOUND')) return NextResponse.json({ error: 'Prateleira não encontrada.' }, { status: 404 });
    throw error;
  }
}

export async function DELETE(_request: Request, context: Context) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);
  const { id } = await context.params;
  try {
    await deleteCategory(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (String(error).includes('CATEGORY_IN_USE')) {
      return NextResponse.json(
        { error: 'Ainda há criações nessa prateleira. Mova-as antes de apagar.' },
        { status: 409 },
      );
    }
    if (String(error).includes('NOT_FOUND')) return NextResponse.json({ error: 'Prateleira não encontrada.' }, { status: 404 });
    throw error;
  }
}
