import { NextResponse } from 'next/server';
import { getAdminApiAccess } from '@/lib/auth/admin';
import { getHero, saveHero } from '@/lib/content/repository';
import { parseHeroInput } from '@/lib/content/creation-validation';
import { ValidationError } from '@/lib/content/validation';

function denied(status: string) {
  const code = status === 'unauthenticated' ? 401 : status === 'unconfigured' ? 503 : 403;
  return NextResponse.json({ error: status }, { status: code });
}

export async function GET() {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);
  return NextResponse.json({ hero: await getHero() });
}

export async function PUT(request: Request) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);
  try {
    const hero = parseHeroInput(await request.json());
    return NextResponse.json({ hero: await saveHero(hero) });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    throw error;
  }
}
