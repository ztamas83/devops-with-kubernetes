# ping_pong

Responds to `GET /pingpong` with `pong <count>` and increments the counter. The counter is stored in the `pongs` table of a Postgres database, using the [postgres](https://github.com/porsager/postgres) client (no dependencies). The first request returns `pong 0`.

`GET /pings` returns the current count without incrementing it (`0` if nothing is stored yet). [log_service](../log_service) uses it to show the count.

On startup the app creates the `pongs` table if it does not exist. It retries the connection 10 times, 3 seconds apart, so it can start before the database is ready.

Every request and response is logged to the console.

## Environment variables

The app exits on startup if a required variable is missing.

| Variable            | Default                | Description           |
| ------------------- | ---------------------- | --------------------- |
| `POSTGRES_HOST`     | `postgres-svc.default` | Database host         |
| `POSTGRES_PORT`     | `5432`                 | Database port         |
| `POSTGRES_DB`       | required               | Database name         |
| `POSTGRES_USER`     | required               | Database user         |
| `POSTGRES_PASSWORD` | required               | Database password     |
| `PORT`              | `3000`                 | Server port           |

## Run locally

Start a Postgres container:

```bash
docker run --rm -d --name pingpong-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:18-alpine
```

`npm start` connects to `localhost:5432` with database, user and password `postgres` (override with `POSTGRES_DB`, `POSTGRES_USER` and `POSTGRES_PASSWORD`) and listens on port 3000, where a locally running [log_service](../log_service) server fetches the count from.

```bash
npm install
```

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
docker build -t ztamas/ping-pong:2.7 .
```

```bash
docker push ztamas/ping-pong:2.7
```

## Deploy to GKE

The Postgres StatefulSet, its ConfigMap and Secret are in [infra](../infra). The deployment reads `POSTGRES_USER` from the `infra-config` ConfigMap and `POSTGRES_PASSWORD` from the `infra-secrets` Secret.

From the repository root, with `kubectl` pointing at the GKE cluster and the sops age key available:

```bash
make exercise-deploy
```

This deploys Postgres to the `default` namespace, and the ConfigMap, Secret and ping-pong manifests to the `exercises` namespace. The app is exposed through a `LoadBalancer` service:

```bash
kubectl -n exercises get svc pingpong-svc
```

```bash
curl http://<EXTERNAL-IP>/pingpong
```
