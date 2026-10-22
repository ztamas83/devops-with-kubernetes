export interface Todo {
  id: string;
  text: string;
}

export interface TodoRepository {
  getAll(): Promise<Todo[]>;
  create(text: string): Promise<Todo>;
}

export function createInMemoryTodoRepository(): TodoRepository {
  const todos: Todo[] = [];

  return {
    async getAll() {
      return todos;
    },

    async create(text) {
      const todo = { id: crypto.randomUUID(), text };
      todos.push(todo);
      return todo;
    },
  };
}
