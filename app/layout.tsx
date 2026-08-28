import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://criacoes.gusgk.com.br'),
  title: 'Minhas Criações GK — Gustavo Giacoia Kumagai',
  description: 'Um espaço pessoal para ideias, experimentos, projetos, memórias e coisas feitas por curiosidade — terminadas ou não.',
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
    description: 'Coisas que eu só quis ver existindo.',
    images: [{ url: '/og.png', width: 1672, height: 941, alt: 'Minhas Criações GK — Coisas que eu só quis ver existindo.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Minhas Criações GK',
    description: 'Coisas que eu só quis ver existindo.',
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
  themeColor: '#080908',
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
