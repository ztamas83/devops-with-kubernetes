import type { TodoService } from "../services/todoService";

export function todoRoutes(todoService: TodoService) {
  return {
    "/api/todos": {
      async GET() {
        return Response.json(await todoService.listTodos());
      },
    },
  };
}
