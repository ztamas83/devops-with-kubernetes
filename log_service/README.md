# log_service

One image, two roles, selected with the `SERVER` environment variable:

- **Generator** (default): generates a random UUID on startup and appends `<timestamp> <uuid>` to the log file every 5 seconds.
- **Server** (`SERVER=1`): serves the log file over HTTP.
  - `GET /status` returns the content of the log file as plain text.

Environment variables:

- `FILE_PATH`: path of the log file (default `/usr/src/app/log.txt`)
- `PORT`: server port (default `3000`)

## Run locally

```bash
FILE_PATH=./log.txt npm run start:generate
```

```bash
FILE_PATH=./log.txt npm run start:server
```

```bash
curl localhost:3000/status
```

## Build the image

```bash
docker build -t ztamas/log-app:1.10 .
```

```bash
docker push ztamas/log-app:1.10
```

## Deploy to k3d

The deployment runs both roles as two containers in one pod, sharing the log file through an `emptyDir` volume.

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
