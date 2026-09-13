import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/db/bootstrap';
import { getDb } from '@/db/index';
import { mediaAssets } from '@/db/schema';
import { getAdminApiAccess } from '@/lib/auth/admin';

function denied(status: string) {
  const code = status === 'unauthenticated' ? 401 : status === 'unconfigured' ? 503 : 403;
  return NextResponse.json({ error: status }, { status: code });
}

/** Everything uploaded so far, newest first, so files can be reused. */
export async function GET() {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') return denied(access.status);
  await ensureDatabase();
  const assets = await getDb().select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)).limit(200);
  return NextResponse.json({ assets });
}
