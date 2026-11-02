import type { SQL } from "bun";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export interface TodoRepository {
  getAll(): Promise<Todo[]>;
  create(text: string): Promise<Todo>;
  // Returns null when no todo has the id
  markDone(id: string): Promise<Todo | null>;
}

// The schema is created by migrations.ts before the repository is used
export function createPostgresTodoRepository(sql: SQL): TodoRepository {
  return {
    async getAll() {
      return sql<Todo[]>`SELECT id, text, done FROM todos ORDER BY created_at`;
    },

    async create(text) {
      const [todo] = await sql<Todo[]>`INSERT INTO todos (text) VALUES (${text}) RETURNING id, text, done`;
      if (!todo) throw new Error("Insert returned no row");
      return todo;
    },

    async markDone(id) {
      const [todo] = await sql<Todo[]>`UPDATE todos SET done = true WHERE id = ${id} RETURNING id, text, done`;
      return todo ?? null;
    },
  };
}
