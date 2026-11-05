import type { Forwarder } from "../forwarder.ts";

export function createLogForwarder(): Forwarder {
  return {
    async forward(data) {
      console.log(`Forwarding message: ${data}`);
    },
  };
}
