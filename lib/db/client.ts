// Swap point: this is the only file that needs to change for production.
// Local dev runs against Node's built-in `node:sqlite` (zero install,
// genuinely real SQL — not a mock) because this sandbox's network
// restrictions block both Prisma's binary engine downloads and
// better-sqlite3's native compilation step. Production runs against
// Postgres (e.g. Supabase) via `pg`. Both branches implement the same
// `query`/`run` interface so calling code never needs to know which is active.

import { readFileSync } from "fs";
import path from "path";

export interface QueryResult<T> {
  rows: T[];
}

export interface DbClient {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  run(sql: string, params?: unknown[]): Promise<{ changes: number }>;
}

let cachedClient: DbClient | null = null;

function isPostgresUrl(url: string): boolean {
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

async function createSqliteClient(filePath: string): Promise<DbClient> {
  // node:sqlite is experimental but stable enough for this use; swapped for
  // Postgres entirely in production, so this branch never runs there.
  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync(filePath);

  const schemaPath = path.join(process.cwd(), "lib", "db", "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");
  db.exec(schema);

  return {
    async query<T>(sql: string, params: unknown[] = []) {
      const stmt = db.prepare(sql);
      const rows = stmt.all(...(params as never[])) as T[];
      return { rows };
    },
    async run(sql: string, params: unknown[] = []) {
      const stmt = db.prepare(sql);
      const result = stmt.run(...(params as never[]));
      return { changes: Number(result.changes) };
    },
  };
}

async function createPostgresClient(connectionString: string): Promise<DbClient> {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });

  // pg uses $1/$2/... placeholders; convert SQLite-style ? before executing
  function toPostgres(sql: string): string {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
  }

  return {
    async query<T>(sql: string, params: unknown[] = []) {
      const result = await pool.query(toPostgres(sql), params);
      return { rows: result.rows as T[] };
    },
    async run(sql: string, params: unknown[] = []) {
      const result = await pool.query(toPostgres(sql), params);
      return { changes: result.rowCount ?? 0 };
    },
  };
}

export async function getDb(): Promise<DbClient> {
  if (cachedClient) return cachedClient;

  const url = process.env.DATABASE_URL ?? "file:./dev.db";

  if (isPostgresUrl(url)) {
    cachedClient = await createPostgresClient(url);
  } else {
    const filePath = url.startsWith("file:") ? url.slice(5) : url;
    cachedClient = await createSqliteClient(filePath);
  }

  return cachedClient;
}
