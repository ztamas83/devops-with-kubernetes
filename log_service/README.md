# log_service

One image, two roles, selected with the `SERVER` environment variable:

- **Generator** (default): generates a random UUID on startup and overwrites `log.txt` with a single `<timestamp> <uuid>` line every 5 seconds.
- **Server** (`SERVER=1`): serves the log over HTTP.
  - `GET /status` returns the content of `log.txt` followed by `Ping / Pongs: <count>`, where the count is read from `ping.txt` (written by [ping_pong](../ping_pong)).

## Environment variables

| Variable   | Default              | Description                                                   |
| ---------- | -------------------- | ------------------------------------------------------------- |
| `LOG_PATH` | `/usr/src/app/files` | Directory holding `log.txt` and `ping.txt`                    |
| `SERVER`   | (unset)              | Set to `1` to run the HTTP server instead of the generator    |
| `PORT`     | `3000`               | Server port (server role only)                                |

## Run locally

The npm scripts use the current directory as `LOG_PATH`. `ping_pong` writes its counter to `../log_service/ping.txt` when started locally, so both apps share the same file.

```bash
npm run start:generate
```

```bash
npm run start:server
```

```bash
curl localhost:3000/status
```

## Build the image

```bash
docker build -t ztamas/log-app:1.11.2 .
```

```bash
docker push ztamas/log-app:1.11.2
```

## Deploy to k3d

The deployment runs both roles as two containers in one pod. They share `/usr/src/app/files` through the `log-pvc` PersistentVolumeClaim, which is also mounted by `ping_pong`.

Create the PersistentVolume and the claim first:

```bash
kubectl apply -f ../infra/persistentvolume.yaml -f ../infra/persistentvolumeclaim.yaml
```

The PersistentVolume is a `local` volume at `/tmp/kube` on node `k3d-k3s-default-agent-0`. The directory must exist on the node and be writable by uid 1000 (the containers run as `node`):

```bash
docker exec k3d-k3s-default-agent-0 sh -c "mkdir -p /tmp/kube && chown 1000:1000 /tmp/kube"
```

```bash
kubectl apply -f manifests/
```

The app is exposed through the shared ingress in `infra/ingress.yaml`:

```bash
kubectl apply -f ../infra/ingress.yaml
```

```bash
curl localhost:8081/status
```
