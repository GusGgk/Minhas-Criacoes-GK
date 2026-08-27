import { CreationsExperience } from '@/components/site/CreationsExperience';
import { getPublishedContent } from '@/lib/content/repository';

export const dynamic = 'force-dynamic';

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Minhas Criações GK',
  url: 'https://criacoes.gusgk.com.br/',
  inLanguage: ['pt-BR', 'en'],
  author: {
    '@type': 'Person',
    name: 'Gustavo Giacoia Kumagai',
    url: 'https://gustavo-giacoia.vercel.app/',
    sameAs: [
      'https://github.com/GusGgk',
      'https://www.youtube.com/@ocanaldecisao',
    ],
  },
};

export default async function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <CreationsExperience content={await getPublishedContent()} />
    </>
  );
}
