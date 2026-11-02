export interface HealthServiceOptions {
  todoBackendUrl?: string;
  timeoutMs: number;
}

export interface HealthService {
  isHealthy(): Promise<boolean>;
}

// The app is healthy when todo-backend reports healthy
export function createHealthService({ todoBackendUrl, timeoutMs }: HealthServiceOptions): HealthService {
  return {
    async isHealthy() {
      if (!todoBackendUrl) {
        console.error("Health check failed: TODO_BACKEND_URL not configured");
        return false;
      }
      try {
        const res = await fetch(`${todoBackendUrl}/healthz`, { signal: AbortSignal.timeout(timeoutMs) });
        if (!res.ok) throw new Error(`todo-backend health check failed: ${res.status} ${res.statusText}`);
        return true;
      } catch (err) {
        console.error(`Health check failed: ${(err as Error).message}`);
        return false;
      }
    },
  };
}
