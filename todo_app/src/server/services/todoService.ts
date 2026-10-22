import type { Todo, TodoRepository } from "../repositories/todoRepository";

export interface TodoService {
  listTodos(): Promise<Todo[]>;
}

export function createTodoService(repository: TodoRepository): TodoService {
  return {
    listTodos() {
      return repository.getAll();
    },
  };
}
