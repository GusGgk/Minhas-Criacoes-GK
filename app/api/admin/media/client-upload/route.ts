import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getAdminApiAccess } from '@/lib/auth/admin';
import { STORAGE_OFF, storageReady } from '@/lib/storage';

/**
 * Hands the browser a short-lived token so the file goes straight to the
 * blob store. Every upload takes this path, images included: a server route
 * caps request bodies at ~4.5 MB on Vercel, which a phone photo passes on its
 * way in and a video passes many times over. The bytes never touch us.
 *
 * The row in media_assets is written afterwards by /api/admin/media/record:
 * Blob's own onUploadCompleted callback only fires from Vercel's network, so it
 * would silently never run in local development.
 */
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export async function POST(request: Request) {
  const access = await getAdminApiAccess();
  if (access.status !== 'allowed') {
    const code = access.status === 'unauthenticated' ? 401 : access.status === 'unconfigured' ? 503 : 403;
    return NextResponse.json({ error: access.status }, { status: code });
  }
  if (!storageReady()) return NextResponse.json({ error: STORAGE_OFF }, { status: 503 });

  const body = await request.json() as HandleUploadBody;

  try {
    const result = await handleUpload({
      request,
      body,
      // The folder in the pathname says what the browser is sending, so the
      // token it gets back only allows that kind and that size.
      onBeforeGenerateToken: async (pathname) => {
        const video = pathname.startsWith('videos/');
        return {
          allowedContentTypes: video ? VIDEO_TYPES : IMAGE_TYPES,
          maximumSizeInBytes: video ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES,
          addRandomSuffix: true,
          cacheControlMaxAge: 31536000,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao autorizar o envio.' },
      { status: 400 },
    );
  }
}
