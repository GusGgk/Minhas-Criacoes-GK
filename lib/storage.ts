/**
 * The blob store is optional the way the database is: the site renders
 * without it, the panel just cannot take files. Everything that touches the
 * store asks here first, so a missing store is one plain sentence in the UI
 * instead of a 500 with an empty body.
 *
 * Vercel connects a store in one of two ways. The older one injects a
 * read-write token, which the SDK finds on its own. The newer one injects only
 * the store id and hands every function invocation a short-lived OIDC token in
 * a request header — the SDK reads that header by itself, but has to be told
 * the store id, and Vercel names that variable with the token prefix rather
 * than the BLOB_STORE_ID the SDK looks for. blobAuth() bridges the two, so
 * every server-side call spreads it in and works under either connection.
 */

function storeId() {
  return process.env.BLOB_READ_WRITE_TOKEN_STORE_ID ?? process.env.BLOB_STORE_ID;
}

export function storageReady(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || storeId());
}

export function blobAuth(): { storeId?: string } {
  const id = storeId();
  return id ? { storeId: id } : {};
}

/** Signs the upload-completed callback; Vercel injects it with the same prefix. */
export function webhookPublicKey(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN_WEBHOOK_PUBLIC_KEY ?? process.env.BLOB_WEBHOOK_PUBLIC_KEY;
}

export const STORAGE_OFF =
  'O armazenamento de arquivos não está conectado: nenhum Blob store ligado a este projeto na Vercel.';
