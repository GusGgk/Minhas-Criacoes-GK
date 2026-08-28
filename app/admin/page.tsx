import Link from 'next/link';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { requireAdminPage } from '@/lib/auth/admin';
import { listAllProjects } from '@/lib/content/repository';
import './admin.css';

export const dynamic = 'force-dynamic';

const SIGN_OUT_PATH = '/api/auth/signout';

export default async function AdminPage() {
  const access = await requireAdminPage();
  if (access.status === 'unconfigured') {
    return <main className="admin-message"><span>GK / CMS</span><h1>Falta liberar sua conta.</h1><p>Defina <code>ADMIN_EMAILS</code> nas variáveis de ambiente do projeto. Até lá, nenhuma escrita é aceita.</p><Link href="/">Voltar ao site</Link></main>;
  }
  if (access.status === 'forbidden') {
    return <main className="admin-message"><span>GK / CMS</span><h1>Acesso não autorizado.</h1><p>A conta <strong>{access.user.email}</strong> não está na lista de administradores.</p><a href={SIGN_OUT_PATH}>Trocar de conta</a></main>;
  }
  const items = await listAllProjects();
  return <AdminDashboard initialItems={items} userName={access.user.name} signOutPath={SIGN_OUT_PATH} />;
}
