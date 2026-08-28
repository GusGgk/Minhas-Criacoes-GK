import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

/** Comma-separated list of e-mails (from the OAuth provider) allowed into /admin. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const allow = adminEmails();
  if (!email || allow.length === 0) return false;
  return allow.includes(email.toLowerCase());
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [GitHub],
  callbacks: {
    signIn({ user, profile }) {
      return isAdminEmail(user?.email ?? profile?.email);
    },
  },
});
