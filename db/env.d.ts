declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    FILES: R2Bucket;
    ADMIN_EMAILS?: string;
    ADMIN_USER_IDS?: string;
  }
}
