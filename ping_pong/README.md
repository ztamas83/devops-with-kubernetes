# ping_pong

Responds to `GET /pingpong` with `pong <count>` and increments the counter. The counter is kept in memory, so it resets when the process restarts.

The server listens on `PORT` (default `3000`).

## Run locally

```bash
npm start
```

```bash
curl localhost:3000/pingpong
```

## Build the image

```bash
docker build -t ping-pong:1.9 .
```

## Deploy to k3d

Import the image into the cluster:

```bash
k3d image import ping-pong:1.9
```
