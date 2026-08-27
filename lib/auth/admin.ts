import { env } from 'cloudflare:workers';
import { getChatGPTUser, requireChatGPTUser, type ChatGPTUser } from '@/app/chatgpt-auth';

export type AdminAccess =
  | { status: 'allowed'; user: ChatGPTUser }
  | { status: 'unconfigured'; user: ChatGPTUser }
  | { status: 'forbidden'; user: ChatGPTUser };

function allowedEmails() {
  return (env.ADMIN_EMAILS ?? '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
}

function allowedUserIds() {
  return (env.ADMIN_USER_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean);
}

function evaluate(user: ChatGPTUser): AdminAccess {
  const emails = allowedEmails();
  const userIds = allowedUserIds();
  if (!emails.length && !userIds.length) {
    return process.env.NODE_ENV === 'development' ? { status: 'allowed', user } : { status: 'unconfigured', user };
  }
  return emails.includes(user.email.toLowerCase()) || userIds.includes(user.userId)
    ? { status: 'allowed', user }
    : { status: 'forbidden', user };
}

export async function requireAdminPage(): Promise<AdminAccess> {
  return evaluate(await requireChatGPTUser('/admin'));
}

export async function getAdminApiAccess(): Promise<AdminAccess | { status: 'unauthenticated' }> {
  const user = await getChatGPTUser();
  return user ? evaluate(user) : { status: 'unauthenticated' };
}
