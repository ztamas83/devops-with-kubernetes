import { z } from "zod";
import type { Todo, TodoRepository } from "../repositories/todoRepository";
import type { TodoAction, TodoEventPublisher } from "./todoEvents";

export const MAX_TODO_LENGTH = 140;

export class ValidationError extends Error {}
export class NotFoundError extends Error {}

const todoTextSchema = z
  .string({ error: "Todo text is required" })
  .trim()
  .min(1, "Todo text is required")
  .max(MAX_TODO_LENGTH, `Todo text must be at most ${MAX_TODO_LENGTH} characters`);

const todoIdSchema = z.uuid("Todo id must be a UUID");

export interface TodoService {
  listTodos(): Promise<Todo[]>;
  createTodo(text: unknown): Promise<Todo>;
  markDone(id: string): Promise<Todo>;
}

export function createTodoService(repository: TodoRepository, events: TodoEventPublisher): TodoService {
  // The todo is already saved at this point, so a failed publish is logged and does not fail the request
  async function announce(todo: Todo, action: TodoAction) {
    try {
      await events.publish(todo, action);
    } catch (err) {
      console.error(`Publishing todo ${todo.id} ${action} event failed: ${(err as Error).message}`);
    }
  }

  return {
    listTodos() {
      return repository.getAll();
    },

    async createTodo(text) {
      const result = todoTextSchema.safeParse(text);
      if (!result.success) {
        throw new ValidationError(result.error.issues.map((issue) => issue.message).join(", "));
      }
      const todo = await repository.create(result.data);
      await announce(todo, "created");
      return todo;
    },

    async markDone(id) {
      const result = todoIdSchema.safeParse(id);
      if (!result.success) {
        throw new ValidationError(result.error.issues.map((issue) => issue.message).join(", "));
      }
      const todo = await repository.markDone(result.data);
      if (!todo) throw new NotFoundError(`Todo ${id} not found`);
      await announce(todo, "done");
      return todo;
    },
  };
}
