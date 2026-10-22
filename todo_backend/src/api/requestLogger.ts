type Handler = (req: Request) => Response | Promise<Response>;
type MethodHandlers = Record<string, Handler>;

function logRequest(req: Request, status: number, startedAt: number, error?: string) {
  const { pathname, search } = new URL(req.url);
  const durationMs = (performance.now() - startedAt).toFixed(1);
  const line = `${new Date().toISOString()} ${req.method} ${pathname}${search} ${status} ${durationMs}ms`;
  if (error) {
    console.error(`${line} ${error}`)
  }
  else
  {
    console.log(line);
  }
}

export function logged(handler: Handler): Handler {
  return async (req) => {
    const startedAt = performance.now();
    try {
      const res = await handler(req);
      // Error responses are logged with their body; clone so the body can still be sent
      const error = res.status >= 400 ? await res.clone().text() : undefined;
      logRequest(req, res.status, startedAt, error);
      return res;
    } catch (err) {
      // Bun turns unhandled errors into a 500 response
      logRequest(req, 500, startedAt, err instanceof Error ? err.message : String(err));
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
