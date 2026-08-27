import { NextResponse } from 'next/server';
import { getPublishedContent } from '@/lib/content/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const content = await getPublishedContent();
  return NextResponse.json(content, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
}
