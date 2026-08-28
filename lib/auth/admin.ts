import { redirect } from 'next/navigation';
import { adminEmails, auth, isAdminEmail } from '@/auth';

export type AdminUser = { name: string; email: string };

export type AdminAccess =
  | { status: 'allowed'; user: AdminUser }
  | { status: 'unconfigured'; user: null }
  | { status: 'forbidden'; user: AdminUser }
  | { status: 'unauthenticated' };

async function evaluate(): Promise<AdminAccess> {
  if (adminEmails().length === 0) {
    return process.env.NODE_ENV === 'development'
      ? { status: 'allowed', user: { name: 'Desenvolvimento', email: 'dev@localhost' } }
      : { status: 'unconfigured', user: null };
  }
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { status: 'unauthenticated' };
  const user: AdminUser = { name: session.user?.name ?? email, email };
  return isAdminEmail(email) ? { status: 'allowed', user } : { status: 'forbidden', user };
}

export async function requireAdminPage(): Promise<Exclude<AdminAccess, { status: 'unauthenticated' }>> {
  const access = await evaluate();
  if (access.status === 'unauthenticated') redirect('/api/auth/signin?callbackUrl=%2Fadmin');
  return access;
}

export async function getAdminApiAccess(): Promise<AdminAccess> {
  return evaluate();
}
