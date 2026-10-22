import type { SQL } from "bun";

export interface Todo {
  id: string;
  text: string;
}

export interface TodoRepository {
  getAll(): Promise<Todo[]>;
  create(text: string): Promise<Todo>;
}

export async function createPostgresTodoRepository(sql: SQL): Promise<TodoRepository> {
  await sql`
    CREATE TABLE IF NOT EXISTS todos (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      text       TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  return {
    async getAll() {
      return sql<Todo[]>`SELECT id, text FROM todos ORDER BY created_at`;
    },

    async create(text) {
      const [todo] = await sql<Todo[]>`INSERT INTO todos (text) VALUES (${text}) RETURNING id, text`;
      if (!todo) throw new Error("Insert returned no row");
      return todo;
    },
  };
}
