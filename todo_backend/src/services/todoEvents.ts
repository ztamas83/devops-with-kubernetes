import type { Todo } from "../repositories/todoRepository";

export type TodoAction = "created" | "done";

export interface TodoEvent {
  id: string;
  text: string;
  action: TodoAction;
}

// Port: announces a change of a todo to other services
export interface TodoEventPublisher {
  publish(todo: Todo, action: TodoAction): Promise<void>;
  close(): Promise<void>;
}
