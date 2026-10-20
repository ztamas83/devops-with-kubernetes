# ping_pong

Responds to `GET /pingpong` with `pong <count>` and increments the counter. The counter is stored in a file, so it survives restarts when the file is on a persistent volume. The first request returns `pong 0`.

## Environment variables

| Variable    | Default                          | Description                       |
| ----------- | -------------------------------- | --------------------------------- |
| `FILE_PATH` | `/usr/src/app/files/count.txt`   | File where the counter is stored  |
| `PORT`      | `3000`                           | Server port                       |

## Run locally

`npm start` writes the counter to `../log_service/ping.txt`, so a locally running [log_service](../log_service) server can read it.

```bash
npm start
```

```bash
curl localhost:3000/pingpong
```

## Build the image

```bash
docker build -t ztamas/ping-pong:1.11 .
```

```bash
docker push ztamas/ping-pong:1.11
```

## Deploy to k3d

The deployment mounts the `log-pvc` PersistentVolumeClaim at `/usr/src/app/files` and writes the counter to `ping.txt`, where `log_service` reads it. See the [log_service README](../log_service/README.md#deploy-to-k3d) for creating the PersistentVolume, the claim and the directory on the node.

```bash
kubectl apply -f manifests/
```

The app is exposed through the shared ingress in `infra/ingress.yaml`:

```bash
kubectl apply -f ../infra/ingress.yaml
```

```bash
curl localhost:8081/pingpong
```
