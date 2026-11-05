# todo_broadcaster

Subscribes to a [NATS](https://nats.io) subject and forwards every received message to an external service. Messages are decoded as UTF-8 strings.

The forwarding is a port with an adapter: the [`Forwarder`](src/forwarder.ts) interface has `forward(data)`. The adapters are [logForwarder](src/adapters/logForwarder.ts), which logs the message, and [discordForwarder](src/adapters/discordForwarder.ts), which posts it to a Discord channel through a webhook. Discord is used when `DISCORD_WEBHOOK_URL` is set, otherwise the message is only logged. To forward elsewhere, add an adapter in `src/adapters` and use it in [index.ts](src/index.ts).

A failed `forward` is logged and the message is skipped. On `SIGTERM`/`SIGINT` the connection is drained, so in-flight messages are handled before the process exits.

`GET /healthz` returns `200 healthy` while the NATS connection is open and `503 unhealthy` once it is closed or draining, for use as a readiness probe.

## Environment variables

The service exits on startup if a required variable is missing.

| Variable           | Required | Description |
| ------------------ | -------- | ----------- |
| `PORT`             | yes | Port of the health endpoint |
| `NATS_URL`         | yes | NATS server, e.g. `nats://localhost:4222` |
| `NATS_SUBJECT`     | yes | Subject to subscribe to |
| `DISCORD_WEBHOOK_URL` | no | Discord webhook URL. Messages are posted to its channel. The URL is a secret: anyone with it can post to the channel |
| `NATS_QUEUE_GROUP` | no  | Queue group. Replicas in the same group share the messages instead of each receiving all of them |

## Run locally

Requires [Bun](https://bun.sh) and a NATS server.

```bash
bun install
PORT=3002 NATS_URL=nats://localhost:4222 NATS_SUBJECT=todos bun run dev
```

Production build: `bun run build`, then `bun run start`.

Publish a test message with the [nats CLI](https://github.com/nats-io/natscli):

```bash
nats pub todos "hello"
```

## Build the image

```bash
docker build -t todo-broadcaster .
```

```bash
docker run --rm --network host -e PORT=3002 -e NATS_URL=nats://localhost:4222 -e NATS_SUBJECT=todos todo-broadcaster
```
