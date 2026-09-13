import Link from 'next/link';
import { CreationsAdmin } from '@/components/admin/CreationsAdmin';
import { requireAdminPage } from '@/lib/auth/admin';
import { getHero, listAllCategories, listAllCreations } from '@/lib/content/repository';
import { storageReady } from '@/lib/storage';
import './admin.css';

export const dynamic = 'force-dynamic';

const SIGN_OUT_PATH = '/api/auth/signout';

export default async function AdminPage() {
  const access = await requireAdminPage();

  if (access.status === 'unconfigured') {
    return (
      <main className="admin-message">
        <span>GK / CMS</span>
        <h1>Falta liberar sua conta.</h1>
        <p>Defina <code>ADMIN_EMAILS</code> nas variáveis de ambiente do projeto. Até lá, nenhuma escrita é aceita.</p>
        <Link href="/">Voltar ao site</Link>
      </main>
    );
  }

  if (access.status === 'forbidden') {
    return (
      <main className="admin-message">
        <span>GK / CMS</span>
        <h1>Acesso não autorizado.</h1>
        <p>A conta <strong>{access.user.email}</strong> não está na lista de administradores.</p>
        <a href={SIGN_OUT_PATH}>Trocar de conta</a>
      </main>
    );
  }

  // The site falls back to bundled content when the database is away, but the
  // panel cannot: editing needs somewhere to write. Say so plainly instead of
  // throwing a stack trace at whoever opened it.
  let creations: Awaited<ReturnType<typeof listAllCreations>>;
  let categories: Awaited<ReturnType<typeof listAllCategories>>;
  let hero: Awaited<ReturnType<typeof getHero>>;
  try {
    [creations, categories, hero] = await Promise.all([listAllCreations(), listAllCategories(), getHero()]);
  } catch (error) {
    console.error('Admin could not reach the database:', error);
    return (
      <main className="admin-message">
        <span>GK / CMS</span>
        <h1>O banco não respondeu.</h1>
        <p>
          O site continua no ar com o conteúdo embutido no código, mas o painel precisa do banco para
          gravar. Confira a variável <code>DATABASE_URL</code> — em produção ela vem da integração Neon
          no painel do Vercel, e localmente do arquivo <code>.env.local</code>.
        </p>
        <Link href="/">Voltar ao site</Link>
      </main>
    );
  }

  return (
    <CreationsAdmin
      initialCreations={creations}
      initialCategories={categories}
      initialHero={hero}
      storageReady={storageReady()}
      userName={access.user.name}
      signOutPath={SIGN_OUT_PATH}
    />
  );
}
