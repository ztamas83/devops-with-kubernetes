# todo_backup

Dumps a Postgres database with `pg_dump` and uploads the dump to a Google Cloud Storage bucket, using the [@google-cloud/storage](https://github.com/googleapis/nodejs-storage) SDK. It runs once and exits: `0` on success, `1` on failure.

The dump uses the custom format (`pg_dump --format=custom`, compressed), and is uploaded as:

```
gs://<GCS_BUCKET>/<POSTGRES_DB>/<POSTGRES_DB>-<timestamp>.dump
```

The dump is written to a temporary file first and only uploaded if `pg_dump` succeeds, so a failed run never leaves a partial dump in the bucket.

The image installs `pg_dump` 18. `pg_dump` refuses to dump a server with a newer major version, so it has to be updated together with the Postgres server.

## Environment variables

The Postgres variables are the same as in [todo_backend](../todo_backend). Only `POSTGRES_PORT` has a default (`5432`): the script exits on startup if a required variable is missing.

| Variable            | Required | Description |
| ------------------- | -------- | ----------- |
| `POSTGRES_HOST`     | yes | Database host |
| `POSTGRES_PORT`     | no  | Database port, defaults to `5432` |
| `POSTGRES_DB`       | yes | Database to dump |
| `POSTGRES_USER`     | yes | Database user |
| `POSTGRES_PASSWORD` | yes | Database password |
| `GCS_BUCKET`        | yes | Bucket the dump is uploaded to |

They are passed to `pg_dump` as libpq environment variables (`PGHOST`, `PGPASSWORD`, ...), so the password never appears on the command line.

GCS credentials come from [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials): Workload Identity in GKE, or `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account key file elsewhere. The identity needs permission to create objects in the bucket (e.g. `roles/storage.objectCreator`).

## Run locally

Requires Node.js 22+ and `pg_dump` 18 on the `PATH`.

```bash
npm install
POSTGRES_HOST=localhost POSTGRES_DB=postgres POSTGRES_USER=postgres POSTGRES_PASSWORD=postgres GCS_BUCKET=my-bucket npm start
```

With the image:

```bash
docker build -t todo-backup .
```

```bash
docker run --rm --add-host=host.docker.internal:host-gateway -e POSTGRES_HOST=host.docker.internal -e POSTGRES_DB=postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e GCS_BUCKET=my-bucket -e GOOGLE_APPLICATION_CREDENTIALS=/key.json -v "$PWD/key.json:/key.json:ro" todo-backup
```

## Restore

```bash
gcloud storage cp gs://my-bucket/postgres/postgres-<timestamp>.dump .
pg_restore --clean --if-exists --dbname=postgres://postgres:postgres@localhost:5432/postgres postgres-<timestamp>.dump
```
