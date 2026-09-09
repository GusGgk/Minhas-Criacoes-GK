import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getAdminApiAccess } from '@/lib/auth/admin';

/**
 * Hands the browser a short-lived token so a large file goes straight to the
 * blob store. Server routes cap request bodies at a few megabytes, which a
 * video passes on its way in — this path never sends the bytes through us.
 *
 * The row in media_assets is written afterwards by /api/admin/media/record:
 * Blob's own onUploadCompleted callback only fires from Vercel's network, so it
 * would silently never run in local development.
 */
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_BYTES = 200 * 1024 * 1024;

export async function POST(request: Request) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') {
    const code = access.status === 'unauthenticated' ? 401 : access.status === 'unconfigured' ? 503 : 403;
    return NextResponse.json({ error: access.status }, { status: code });
  }

  const body = await request.json() as HandleUploadBody;

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: VIDEO_TYPES,
        maximumSizeInBytes: MAX_BYTES,
        addRandomSuffix: true,
        cacheControlMaxAge: 31536000,
      }),
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao autorizar o envio.' },
      { status: 400 },
    );
  }
}
