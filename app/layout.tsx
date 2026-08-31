import type { Metadata, Viewport } from 'next';
import './globals.css';

/**
 * Runs before the first paint so the chosen theme is already on <html> and the
 * page never flashes the wrong ground. Kept inline and tiny on purpose.
 */
const applyTheme = `(function(){try{var t=localStorage.getItem('gk-theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.theme=t}catch(e){}})()`;

export const metadata: Metadata = {
  metadataBase: new URL('https://criacoes.gusgk.com.br'),
  title: 'Minhas Criações GK — Gustavo Giacoia Kumagai',
  description: 'As criações de Gustavo Giacoia Kumagai: sete frentes de trabalho e de vida, com as fotos e os registros que cada uma deixou.',
  authors: [{ name: 'Gustavo Giacoia Kumagai', url: 'https://gustavo-giacoia.vercel.app/' }],
  creator: 'Gustavo Giacoia Kumagai',
  alternates: { canonical: '/' },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Minhas Criações GK',
    title: 'Minhas Criações GK — Gustavo Giacoia Kumagai',
    description: 'Tudo o que eu quis ver existindo.',
    images: [{ url: '/og.png', width: 1672, height: 941, alt: 'Minhas Criações GK — tudo o que eu quis ver existindo.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Minhas Criações GK',
    description: 'Tudo o que eu quis ver existindo.',
    images: ['/og.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#080908' },
    { media: '(prefers-color-scheme: light)', color: '#f4f1ea' },
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: applyTheme }} /></head>
      <body>{children}</body>
    </html>
  );
}
