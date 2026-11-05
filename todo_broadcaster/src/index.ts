import { connect } from "@nats-io/transport-node";
import { createDiscordForwarder } from "./adapters/discordForwarder.ts";
import { createLogForwarder } from "./adapters/logForwarder.ts";
import { config } from "./config.ts";

// Forwards to Discord when a webhook is configured, otherwise only logs
const forwarder = config.discordWebhookUrl
  ? createDiscordForwarder(config.discordWebhookUrl)
  : createLogForwarder();

const nc = await connect({ servers: config.natsUrl });
console.log(`Connected to ${nc.getServer()}, subscribing to ${config.natsSubject}`);

// A queue group makes replicas share the messages instead of each
// forwarding every one
const sub = nc.subscribe(config.natsSubject, { queue: config.natsQueueGroup });

// Healthy while the NATS connection can still receive messages
const server = Bun.serve({
  port: config.port,
  routes: {
    "/healthz": () => {
      const healthy = !nc.isClosed() && !nc.isDraining();
      return new Response(healthy ? "healthy" : "unhealthy", {
        status: healthy ? 200 : 503,
        headers: { "Content-Type": "text/plain" },
      });
    },
  },
  fetch: () => new Response("Not found", { status: 404 }),
});
console.log(`Health endpoint on port ${server.port}`);

const shutdown = () => {
  // A repeated signal must not drain twice
  if (nc.isDraining() || nc.isClosed()) return;
  void nc.drain().then(() => server.stop());
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

for await (const msg of sub) {
  try {
    await forwarder.forward(msg.string());
  } catch (err) {
    console.error(`Forwarding failed: ${err instanceof Error ? err.message : err}`);
  }
}
console.log("Subscription closed");
