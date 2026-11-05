# todo_backend

Bun server that serves the todo REST API used by the [todo_app](../todo_app) SPA. Prints `Server started on port NNNN` on startup.

Todos are stored in the `todos` table of a Postgres database, using Bun's built-in SQL client (`Bun.SQL`). On startup the server applies the pending schema migrations from `src/migrations.ts` (see [Migrations](#migrations)). It retries the first connection 10 times, 3 seconds apart, so it can start before the database is ready.

## Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/healthz` | `200 healthy` when the database answers a `SELECT 1`, `503 unhealthy` otherwise |
| `GET` | `/todos` | List of todos (JSON) |
| `PUT` | `/todos/:id` | Mark a todo done. No body. Returns the updated todo, `400` if the id is not a UUID, `404` if no todo has the id |
| `POST` | `/todos` | Create a todo. Body: `{ "text": "..." }`. Returns the created todo with `201`, or `400` if the text is missing, empty or longer than 140 characters |

Every request is logged to stdout with method, path, response status and duration:

```
2026-10-22T07:38:48.639Z POST /todos 201 0.6ms
```

## Events

Creating and completing a todo publishes a JSON message to the NATS subject `NATS_SUBJECT`, after the todo is saved:

```json
{ "id": "7b38f437-6501-45ff-8748-c5c8d5d63cf4", "text": "test", "action": "created" }
```

`action` is `created` (`POST /todos`) or `done` (`PUT /todos/:id`). A failed publish is logged and does not fail the request. The server keeps retrying the first NATS connection on startup. [todo_broadcaster](../todo_broadcaster) subscribes to the subject.

Code layout (`src`):

- `api/`: HTTP route handlers and request logging
- `services/`: business logic (validation)
- `repositories/`: storage (todos in Postgres)
- `events/`: publishing todo events (NATS)
- `db.ts`: database connection
- `migrations.ts`: schema migrations

## Migrations

The schema is managed by the numbered migrations in `src/migrations.ts`. On startup the server runs the ones not yet listed in the `schema_migrations` table, in one transaction, and records each applied version. A Postgres advisory lock makes replicas starting at the same time wait for each other instead of applying the same migration twice.

To change the schema, append a new migration with the next version number. Never edit or reorder a migration that has already been applied.

| Version | Change |
| ------- | ------ |
| 1 | Create the `todos` table |
| 2 | Add the `done` flag to `todos` |

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
| `NATS_URL` | yes | NATS server, e.g. `nats://localhost:4222` |
| `NATS_SUBJECT` | yes | Subject the todo events are published to |

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

## Postgres: DBaaS vs DIY

| | DBaaS | DIY | Winner |
| - | ----- | --- | ------ |
| Initialization: required work | simple, one command / GCP console / IaC | advanced, configuration of ENV variables, secret handling, manifests for deployment | DBaaS |
| Initialization: costs | I presume a minimum cost of around $30/month for a Cloud SQL instance | Irrelevant in a running cluster | DIY |
| Maintenance: required work | little, few clicks | moderate, need to update image version, eventual data migration | DBaaS |
| Maintenance: costs | variable, depending on e.g. backup size, etc | disks are allocated per size, not dynamic | DBaaS |
| Backup methods | GCP configured, Cloud Run scheduled jobs, k8s CronJob | k8s CronJob, manual script | DBaaS |
| Backup: ease of use | simple | advanced | DBaaS |

DBaaS is the clean winner in terms of required work and ease of use but definitely involves higher costs due to monthly fixed costs. DIY solution is cost effective as the k8s cluster is already available and the resources required by PostgreSQL is negligible in a bigger cluster.
I would choose DBaaS for a smoother experience and focus on my own workloads instead.