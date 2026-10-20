# todo_app

Bun server that serves a React SPA on `GET /`. Prints `Server started in port NNNN` on startup.

The client lives in `src/client` and is bundled by Bun through the HTML import in `src/server.ts`.

## Configuration

| Variable   | Default | Description |
| ---------- | ------- | ----------- |
| `PORT`     | `3000`  | Port the server listens on |
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
