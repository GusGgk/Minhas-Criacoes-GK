/**
 * A video block accepts two very different things in the same field: a file we
 * host (blob store or /public) and a link to YouTube or Vimeo. Only the first
 * one plays in a <video> tag — a watch page is HTML, not a video stream, so the
 * player renders empty. This turns the second kind into its embed address and
 * lets the caller pick the right element.
 */
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);

/** the 11-character id YouTube puts in every one of its URL shapes */
const YOUTUBE_ID = /^[\w-]{11}$/;

function youtubeId(url: URL): string | null {
  if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null;
  const [, first, second] = url.pathname.split('/');
  if (first === 'watch') return url.searchParams.get('v');
  // /embed/ID, /shorts/ID, /live/ID and /v/ID all carry the id in the same slot.
  if (['embed', 'shorts', 'live', 'v'].includes(first)) return second ?? null;
  return null;
}

/**
 * The embed address for a hosted-elsewhere video, or null when the link points
 * at a file we can play directly.
 */
export function embedUrl(src: string): string | null {
  if (!src || src.startsWith('/')) return null;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }

  if (url.hostname === 'youtu.be' || YOUTUBE_HOSTS.has(url.hostname)) {
    const id = youtubeId(url);
    if (!id || !YOUTUBE_ID.test(id)) return null;
    // nocookie keeps YouTube from writing tracking cookies for people who only
    // scrolled past the block without pressing play.
    const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
    const start = url.searchParams.get('t') ?? url.searchParams.get('start');
    const seconds = start ? parseInt(start, 10) : NaN;
    if (Number.isFinite(seconds) && seconds > 0) embed.searchParams.set('start', String(seconds));
    return embed.toString();
  }

  if (VIMEO_HOSTS.has(url.hostname)) {
    const id = url.pathname.split('/').filter(Boolean).pop();
    if (!id || !/^\d+$/.test(id)) return null;
    return `https://player.vimeo.com/video/${id}`;
  }

  return null;
}
