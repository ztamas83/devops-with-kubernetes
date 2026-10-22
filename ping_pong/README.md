# ping_pong

Responds to `GET /pingpong` with `pong <count>` and increments the counter. The counter is stored in a file, so it survives restarts when the file is on a persistent volume. The first request returns `pong 0`.

`GET /pings` returns the current count without incrementing it (`0` if nothing is stored yet). [log_service](../log_service) uses it to show the count.

Every request and response is logged to the console.

## Environment variables

| Variable    | Default                          | Description                       |
| ----------- | -------------------------------- | --------------------------------- |
| `FILE_PATH` | `/usr/src/app/files/count.txt`   | File where the counter is stored  |
| `PORT`      | `3000`                           | Server port                       |

## Run locally

`npm start` listens on port 3000, where a locally running [log_service](../log_service) server fetches the count from.

```bash
npm start
```

```bash
curl localhost:3000/pingpong
```

```bash
curl localhost:3000/pings
```

## Build the image

```bash
docker build -t ztamas/ping-pong:2.1 .
```

```bash
docker push ztamas/ping-pong:2.1
```

## Deploy to k3d

The deployment mounts the `log-pvc` PersistentVolumeClaim at `/usr/src/app/files` and writes the counter to `ping.txt`. `log_service` reads the count through `GET /pings` on the `pingpong-svc` service. See the [log_service README](../log_service/README.md#deploy-to-k3d) for creating the PersistentVolume, the claim and the directory on the node.

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
