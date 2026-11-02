import type { SQL } from "bun";

interface Migration {
  version: number;
  name: string;
  up(sql: SQL): Promise<unknown>;
}

// Append new migrations to the end, never change or reorder applied ones
const migrations: Migration[] = [
  {
    version: 1,
    name: "create todos table",
    // IF NOT EXISTS: databases created before migrations were tracked already have the table
    up: (sql) => sql`
      CREATE TABLE IF NOT EXISTS todos (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        text       TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `,
  },
  {
    version: 2,
    name: "add done flag to todos",
    up: (sql) => sql`ALTER TABLE todos ADD COLUMN IF NOT EXISTS done BOOLEAN NOT NULL DEFAULT false`,
  },
];

// Arbitrary key, makes concurrently starting replicas run the migrations one at a time
const MIGRATION_LOCK_KEY = 4242;

export async function runMigrations(sql: SQL) {
  await sql.begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(${MIGRATION_LOCK_KEY})`;
    await tx`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    INT PRIMARY KEY,
        name       TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    const applied = new Set(
      (await tx<{ version: number }[]>`SELECT version FROM schema_migrations`).map((row) => row.version),
    );

    for (const migration of migrations) {
      if (applied.has(migration.version)) continue;
      console.log(`Applying migration ${migration.version}: ${migration.name}`);
      await migration.up(tx);
      await tx`INSERT INTO schema_migrations (version, name) VALUES (${migration.version}, ${migration.name})`;
    }
  });
}
