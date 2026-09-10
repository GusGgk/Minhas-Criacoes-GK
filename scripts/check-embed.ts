/**
 * The video field takes both hosted files and links to YouTube or Vimeo, and
 * the two render with different elements. These are the URL shapes people
 * actually paste — a wrong answer here shows up as an empty player.
 */
import { embedUrl } from '../lib/content/embed';

const cases: [string, string | null][] = [
  ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'],
  ['https://youtu.be/dQw4w9WgXcQ', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'],
  ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'],
  ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'],
  ['https://m.youtube.com/watch?v=dQw4w9WgXcQ&feature=share', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'],
  ['https://youtu.be/dQw4w9WgXcQ?t=42', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=42'],
  ['https://vimeo.com/123456789', 'https://player.vimeo.com/video/123456789'],
  // files we host stay on the <video> path
  ['/media/clipe.mp4', null],
  ['https://algo.public.blob.vercel-storage.com/videos/clipe.mp4', null],
  // junk must not become an iframe pointing nowhere
  ['https://www.youtube.com/', null],
  ['https://www.youtube.com/watch?v=curto', null],
  ['nao-e-url', null],
  ['', null],
];

let bad = 0;
for (const [input, expected] of cases) {
  const got = embedUrl(input);
  const ok = got === expected;
  if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'FALHA'} ${input || '(vazio)'} -> ${got ?? 'arquivo direto'}`);
}

console.log(bad === 0 ? '\nTodos os formatos de link viram o embed certo.' : `\n${bad} caso(s) errado(s).`);
process.exit(bad === 0 ? 0 : 1);
