function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(required("PORT")),
  natsUrl: required("NATS_URL"),
  natsSubject: required("NATS_SUBJECT"),
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || undefined,
  natsQueueGroup: process.env.NATS_QUEUE_GROUP || undefined,
};
