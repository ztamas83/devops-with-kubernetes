type Handler = (req: Request) => Response | Promise<Response>;
type MethodHandlers = Record<string, Handler>;

function logRequest(req: Request, status: number, startedAt: number) {
  const { pathname, search } = new URL(req.url);
  const durationMs = (performance.now() - startedAt).toFixed(1);
  console.log(`${new Date().toISOString()} ${req.method} ${pathname}${search} ${status} ${durationMs}ms`);
}

export function logged(handler: Handler): Handler {
  return async (req) => {
    const startedAt = performance.now();
    try {
      const res = await handler(req);
      logRequest(req, res.status, startedAt);
      return res;
    } catch (err) {
      // Bun turns unhandled errors into a 500 response
      logRequest(req, 500, startedAt);
      throw err;
    }
  };
}

export function withLogging(routes: Record<string, MethodHandlers>) {
  return Object.fromEntries(
    Object.entries(routes).map(([path, methods]) => [
      path,
      Object.fromEntries(Object.entries(methods).map(([method, handler]) => [method, logged(handler)])),
    ]),
  );
}
