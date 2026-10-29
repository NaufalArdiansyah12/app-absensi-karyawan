/// <reference types="@cloudflare/workers-types" />
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type DbClient = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Inisialisasi koneksi Drizzle ORM dengan Cloudflare D1.
 */
export function getDb(d1: D1Database): DbClient {
  return drizzle(d1, { schema });
}

export * from "./schema";

