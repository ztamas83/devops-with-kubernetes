export function healthRoutes(isHealthy: () => Promise<boolean>) {
  return {
    "/healthz": {
      async GET() {
        const healthy = await isHealthy();
        return new Response(healthy ? "healthy" : "unhealthy", {
          status: healthy ? 200 : 503,
          headers: { "Content-Type": "text/plain" },
        });
      },
    },
  };
}
