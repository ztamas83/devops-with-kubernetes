import type { Forwarder } from "../forwarder.ts";

const MAX_CONTENT_LENGTH = 2000;

// Todo events are JSON ({ id, text, action }), anything else is sent as is
function toContent(data: string): string {
  try {
    const { id, text, action } = JSON.parse(data);
    if (typeof text === "string" && typeof action === "string") {
      return `Todo ${action}: ${text} (${id})`;
    }
  } catch {
    // not JSON
  }
  return data;
}

export function createDiscordForwarder(webhookUrl: string): Forwarder {
  return {
    async forward(data) {
      const content = toContent(data).slice(0, MAX_CONTENT_LENGTH);
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          // Todo text is user input, it must not be able to ping anyone
          allowed_mentions: { parse: [] },
        }),
      });
      if (!response.ok) {
        throw new Error(`Discord webhook responded ${response.status}: ${await response.text()}`);
      }
      console.log(`Sent message to Discord: ${content}`);
    },
  };
}
