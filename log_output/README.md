# log_output

Generates a random UUID on startup and prints it with a timestamp every 5 seconds.

Exposes the current status over HTTP:

- `GET /status` returns the latest timestamp and the random string, e.g. `{"timestamp":"2026-10-20T13:00:12.494Z","id":"d13bc74d-..."}`

The server listens on `PORT` (default `3000`).

## Run locally

```bash
npm start
```

## Build the image

```bash
docker build -t log-output:1.1 .
```

## Deploy to k3d

Import the image into the cluster (no registry needed):

```bash
k3d image import log-output:1.1
```

Create the deployment:

```bash
kubectl create deployment log-output --image=log-output:1.1
```

Check the output:

```bash
kubectl logs -f deployment/log-output
```

Query the status endpoint:

```bash
kubectl port-forward deployment/log-output 3000:3000
```

```bash
curl localhost:3000/status
```
