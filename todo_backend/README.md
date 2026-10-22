# todo_backend

Bun server that serves the todo REST API used by the [todo_app](../todo_app) SPA. Prints `Server started on port NNNN` on startup.

Todos are stored in the `todos` table of a Postgres database, using Bun's built-in SQL client (`Bun.SQL`). On startup the server creates the table if it does not exist. It retries the first connection 10 times, 3 seconds apart, so it can start before the database is ready.

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
- `repositories/`: storage (todos in Postgres)
- `db.ts`: database connection

## Configuration

All configuration comes from environment variables. Only `POSTGRES_PORT` has a default (`5432`): the server exits on startup if a required variable is missing.

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `PORT`   | yes | Port the server listens on |
| `POSTGRES_HOST` | yes | Database host |
| `POSTGRES_PORT` | no | Database port, defaults to `5432` |
| `POSTGRES_DB` | yes | Database name |
| `POSTGRES_USER` | yes | Database user |
| `POSTGRES_PASSWORD` | yes | Database password |

In the cluster the variables are set in [manifests/deployment.yaml](manifests/deployment.yaml). `POSTGRES_USER` comes from the `infra-config` ConfigMap and `POSTGRES_PASSWORD` from the `infra-secrets` Secret in [infra](../infra).

## Run locally

Requires [Bun](https://bun.sh) 1.4+.

Start a Postgres container:

```bash
docker run --rm -d --name todo-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:18-alpine
```

Copy the example configuration (port `3001`, Postgres on `localhost` with user and password `postgres`). Bun loads `.env` automatically.

```bash
cp .env.example .env
```

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
