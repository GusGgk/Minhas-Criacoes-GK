import { NextResponse } from 'next/server';
import { getAdminApiAccess } from '@/lib/auth/admin';
import { createProject, listAllProjects } from '@/lib/content/repository';
import { parseProjectInput, ValidationError } from '@/lib/content/validation';

function denied(status: string) {
  const code = status === 'unauthenticated' ? 401 : status === 'unconfigured' ? 503 : 403;
  return NextResponse.json({ error: status }, { status: code });
}

export async function GET() {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);
  return NextResponse.json({ items: await listAllProjects() });
}

export async function POST(request: Request) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);
  try {
    const input = parseProjectInput(await request.json());
    return NextResponse.json({ item: await createProject(input) }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (/UNIQUE|duplicate key/i.test(String(error))) return NextResponse.json({ error: 'Este slug já está em uso.' }, { status: 409 });
    throw error;
  }
}
