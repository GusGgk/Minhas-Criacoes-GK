import { NextResponse } from 'next/server';
import { getAdminApiAccess } from '@/lib/auth/admin';
import { createCreation, listAllCategories, listAllCreations } from '@/lib/content/repository';
import { parseCreationInput } from '@/lib/content/creation-validation';
import { ValidationError } from '@/lib/content/validation';

function denied(status: string) {
  const code = status === 'unauthenticated' ? 401 : status === 'unconfigured' ? 503 : 403;
  return NextResponse.json({ error: status }, { status: code });
}

export async function GET() {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);
  const [creations, categories] = await Promise.all([listAllCreations(), listAllCategories()]);
  return NextResponse.json({ creations, categories });
}

export async function POST(request: Request) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);
  try {
    const input = parseCreationInput(await request.json());
    return NextResponse.json({ creation: await createCreation(input) }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (/unique|duplicate key/i.test(String(error))) {
      return NextResponse.json({ error: 'Já existe uma criação com esse endereço.' }, { status: 409 });
    }
    throw error;
  }
}
