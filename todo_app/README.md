# todo_app

Bun server that serves a React SPA on `GET /`. Prints `Server started in port NNNN` on startup.

The client lives in `src/client` and is bundled by Bun through the HTML import in `src/server.ts`.

The page shows the title, a random image (300x300) served from `GET /api/image`, an input field (max 140 characters) with a "Send" button, the list of todos (each with a "Mark done" button that sends `PUT /todos/:id`; done todos get a green marker, strikethrough text and a green "Done" label) and a red "Break app" button. The button makes the app report unhealthy until it is restarted; the page then shows only a "System failure, wait for recovery" warning.

Todos are served by the separate [todo_backend](../todo_backend) service. The SPA calls `GET /todos` and `POST /todos` on its own origin; in the cluster the Ingress routes `/todos` to todo-backend. For local development set `TODO_BACKEND_URL` and this server proxies `/todos` to the backend.

The image is fetched from `IMAGE_SOURCE_URL` and cached on disk in `IMAGE_DIR`. A cached image younger than `IMAGE_MAX_AGE_MS` is served as is; otherwise a new one is fetched, stored and served. If the fetch fails, the stale cached image is served.

## Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/` | Todo app SPA |
| `GET` | `/healthz` | `200 healthy` when `GET $TODO_BACKEND_URL/healthz` returns `200` within 1 second, `503 unhealthy` otherwise (also when `TODO_BACKEND_URL` is not set or the app was broken) |
| `GET` | `/api/health` | `{ "broken": boolean }`, whether the app was broken with `/api/break` |
| `POST` | `/api/break` | Makes `/healthz` return `503` for the rest of the process lifetime. Used by the "Break app" button |
| `GET` | `/api/image` | Random image (JPEG), cached on disk for `IMAGE_MAX_AGE_MS` |
| any | `/todos`, `/todos/:id` | Proxied to `TODO_BACKEND_URL` when set, `404` otherwise |
| any | `/crash` | Aborts the process immediately (`process.abort()`). For testing container restarts and that the cached image survives them |

Server code layout (`src/server`):

- `api/`: HTTP route handlers
- `services/`: business logic (cache expiry, refresh)
- `repositories/`: storage (image on disk)

## Configuration

All configuration comes from environment variables. There are no defaults in the code: the server exits on startup if a required variable is missing.

| Variable   | Required | Description |
| ---------- | -------- | ----------- |
| `PORT`     | yes | Port the server listens on |
| `IMAGE_DIR` | yes | Directory where the cached image is stored |
| `IMAGE_MAX_AGE_MS` | yes | How long a cached image is served before a new one is fetched, in milliseconds |
| `IMAGE_SOURCE_URL` | yes | URL a random image is fetched from, e.g. `https://picsum.photos/600` |
| `TODO_BACKEND_URL` | no | Base URL of todo_backend, e.g. `http://localhost:3001`. Checked by `/healthz`; locally `/todos` is also proxied to it |
| `NODE_ENV` | no | `production` serves the prebuilt bundle, anything else enables Bun dev mode (HMR) |

In the cluster the values come from the `todo-app-cm` ConfigMap ([manifests/configMap.yaml](manifests/configMap.yaml)).

## Run locally

Requires [Bun](https://bun.sh) 1.4+.

Copy the example configuration. Bun loads `.env` automatically. The example points `TODO_BACKEND_URL` to todo_backend running locally on port 3001 (see its README).

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

`bun run build` bundles the server and the SPA into `dist/`. The server must be started from inside `dist/` since bundled asset paths resolve relative to the working directory; `bun run start` does that and loads `../.env`.

Any variable can be overridden on the command line:

```bash
PORT=8080 bun run dev
```

## Build the image

```bash
docker build -t todo-app .
```
