# todo_backend

Bun server that serves the todo REST API used by the [todo_app](../todo_app) SPA. Prints `Server started on port NNNN` on startup.

Todos are kept in memory, so they are lost when the process restarts.

## Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/todos` | List of todos (JSON) |
| `POST` | `/todos` | Create a todo. Body: `{ "text": "..." }`. Returns the created todo with `201`, or `400` if the text is missing, empty or longer than 140 characters |

Every request is logged to stdout with method, path, response status and duration:

```
2026-10-22T07:38:48.639Z POST /todos 201 0.6ms
```

Code layout (`src`):

- `api/`: HTTP route handlers and request logging
- `services/`: business logic (validation)
- `repositories/`: storage (todos in memory)

## Configuration

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `PORT`   | `3001`  | Port the server listens on |

## Run locally

Requires [Bun](https://bun.sh) 1.4+.

```bash
bun install
bun run dev
```

Production build:

```bash
bun run build
bun run start
```

Try it:

```bash
curl -X POST -H 'Content-Type: application/json' -d '{"text":"Buy oat milk"}' localhost:3001/todos
```

```bash
curl localhost:3001/todos
```

## Build the image

```bash
docker build -t todo-backend .
```
