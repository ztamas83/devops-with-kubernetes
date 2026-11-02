import type { HealthService } from "../services/healthService";

export function healthRoutes(healthService: HealthService) {
  // Set by the "Break app" button, /healthz reports unhealthy for the rest of the process lifetime
  let broken = false;

  return {
    "/healthz": {
      async GET() {
        const healthy = !broken && (await healthService.isHealthy());
        return new Response(healthy ? "healthy" : "unhealthy", {
          status: healthy ? 200 : 503,
          headers: { "Content-Type": "text/plain" },
        });
      },
    },
    "/api/health": {
      GET() {
        return Response.json({ broken });
      },
    },
    "/api/break": {
      POST() {
        broken = true;
        console.error("App broken on request, /healthz reports unhealthy from now on");
        return Response.json({ broken: true });
      },
    },
  };
}
