import { connect } from "@nats-io/transport-node";
import type { TodoEvent, TodoEventPublisher } from "../services/todoEvents";

export async function createNatsTodoEventPublisher(url: string, subject: string): Promise<TodoEventPublisher> {
  // Keep retrying if NATS starts after the server, like the database connection
  const nc = await connect({ servers: url, waitOnFirstConnect: true });
  console.log(`Connected to NATS ${nc.getServer()}, publishing todo events to ${subject}`);

  return {
    async publish(todo, action) {
      const event: TodoEvent = { id: todo.id, text: todo.text, action };
      nc.publish(subject, JSON.stringify(event));
    },

    async close() {
      await nc.drain();
    },
  };
}
