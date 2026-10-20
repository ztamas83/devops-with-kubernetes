# todo_app

Bun server that serves a React SPA on `GET /`. Prints `Server started in port NNNN` on startup.

The client lives in `src/client` and is bundled by Bun through the HTML import in `src/server.ts`.

The page shows the title and a random image served from `GET /api/image`. The image comes from https://picsum.photos/600 and is cached on disk in `IMAGE_DIR`. A cached image younger than 10 minutes is served as is; otherwise a new one is fetched, stored and served. If the fetch fails, the stale cached image is served.

## Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/` | Todo app SPA |
| `GET` | `/api/image` | Random image (JPEG), cached on disk for 10 minutes |
| any | `/crash` | Aborts the process immediately (`process.abort()`). For testing container restarts and that the cached image survives them |

Server code layout (`src/server`):

- `api/`: HTTP route handlers
- `services/`: business logic (cache expiry, refresh)
- `repositories/`: disk storage

## Configuration

| Variable   | Default | Description |
| ---------- | ------- | ----------- |
| `PORT`     | `3000`  | Port the server listens on |
| `IMAGE_DIR` | `./data/images` | Directory where the cached image is stored |
| `NODE_ENV` | (unset) | `production` serves the prebuilt bundle, anything else enables Bun dev mode (HMR) |

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

`bun run build` bundles the server and the SPA into `dist/`. The server must be started from inside `dist/` since bundled asset paths resolve relative to the working directory; `bun run start` does that.

With a custom port:

```bash
PORT=8080 bun run dev
```

## Build the image

```bash
docker build -t todo-app .
```
