import { NextResponse } from 'next/server';
import { getAdminApiAccess } from '@/lib/auth/admin';
import { createCategory, listAllCategories } from '@/lib/content/repository';
import { parseCategoryInput } from '@/lib/content/creation-validation';
import { ValidationError } from '@/lib/content/validation';

function denied(status: string) {
  const code = status === 'unauthenticated' ? 401 : status === 'unconfigured' ? 503 : 403;
  return NextResponse.json({ error: status }, { status: code });
}

export async function GET() {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);
  return NextResponse.json({ categories: await listAllCategories() });
}

export async function POST(request: Request) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);
  try {
    const input = parseCategoryInput(await request.json());
    return NextResponse.json({ category: await createCategory(input) }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (/unique|duplicate key/i.test(String(error))) {
      return NextResponse.json({ error: 'Já existe uma prateleira com esse identificador.' }, { status: 409 });
    }
    throw error;
  }
}
