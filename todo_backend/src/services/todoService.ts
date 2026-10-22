import type { Todo, TodoRepository } from "../repositories/todoRepository";

export const MAX_TODO_LENGTH = 140;

export class ValidationError extends Error {}

export interface TodoService {
  listTodos(): Promise<Todo[]>;
  createTodo(text: unknown): Promise<Todo>;
}

export function createTodoService(repository: TodoRepository): TodoService {
  return {
    listTodos() {
      return repository.getAll();
    },

    createTodo(text) {
      if (typeof text !== "string" || text.trim() === "") {
        throw new ValidationError("Todo text is required");
      }
      const trimmed = text.trim();
      if (trimmed.length > MAX_TODO_LENGTH) {
        throw new ValidationError(`Todo text must be at most ${MAX_TODO_LENGTH} characters`);
      }
      return repository.create(trimmed);
    },
  };
}
