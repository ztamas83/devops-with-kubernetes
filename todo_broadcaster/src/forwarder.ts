// Port: delivers a received message to an external service
export interface Forwarder {
  forward(data: string): Promise<void>;
}
