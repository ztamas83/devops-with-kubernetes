export interface Todo {
  id: string;
  text: string;
}

export interface TodoRepository {
  getAll(): Promise<Todo[]>;
}

const HARDCODED_TODOS: Todo[] = [
  { id: "1", text: "Water the office plants" },
  { id: "2", text: "Learn how PersistentVolumes work" },
  { id: "3", text: "Buy oat milk and coffee beans" },
];

export function createHardcodedTodoRepository(): TodoRepository {
  return {
    async getAll() {
      return HARDCODED_TODOS;
    },
  };
}
