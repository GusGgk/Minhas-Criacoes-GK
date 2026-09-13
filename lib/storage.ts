/**
 * The blob store is optional the way the database is: the site renders
 * without it, the panel just cannot take files. Everything that touches the
 * store asks here first, so a missing token is one plain sentence in the UI
 * instead of a 500 with an empty body.
 */
export function storageReady(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export const STORAGE_OFF =
  'O armazenamento de arquivos não está conectado: falta a variável BLOB_READ_WRITE_TOKEN no projeto.';
