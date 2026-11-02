import type { BunRequest } from "bun";
import { NotFoundError, ValidationError, type TodoService } from "../services/todoService";

export function todoRoutes(todoService: TodoService) {
  return {
    "/todos": {
      async GET() {
        return Response.json(await todoService.listTodos());
      },

      async POST(req: Request) {
        let body: { text?: unknown } | null;
        try {
          body = (await req.json()) as { text?: unknown } | null;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        try {
          const todo = await todoService.createTodo(body?.text);
          return Response.json(todo, { status: 201 });
        } catch (err) {
          if (err instanceof ValidationError) {
            return Response.json({ error: err.message }, { status: 400 });
          }
          throw err;
        }
      },
    },

    "/todos/:id": {
      // withLogging types handlers with a plain Request, Bun passes the route params too
      async PUT(req: Request) {
        const { id } = (req as BunRequest<"/todos/:id">).params;
        try {
          return Response.json(await todoService.markDone(id));
        } catch (err) {
          if (err instanceof ValidationError) {
            return Response.json({ error: err.message }, { status: 400 });
          }
          if (err instanceof NotFoundError) {
            return Response.json({ error: err.message }, { status: 404 });
          }
          throw err;
        }
      },
    },
  };
}
