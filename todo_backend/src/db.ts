import { SQL } from "bun";
import { config } from "./config";

export const sql = new SQL({
  adapter: "postgres",
  hostname: config.postgres.host,
  port: config.postgres.port,
  database: config.postgres.database,
  username: config.postgres.user,
  password: config.postgres.password,
});

// The database may start after the server in the cluster, so retry the first connection
export async function waitForDatabase(retries = 10, delayMs = 3000) {
  for (let attempt = 1; ; attempt++) {
    try {
      await sql`SELECT 1`;
      return;
    } catch (err) {
      if (attempt >= retries) throw err;
      console.log(`Database not ready (${(err as Error).message}), retrying in ${delayMs}ms (${attempt}/${retries})`);
      await Bun.sleep(delayMs);
    }
  }
}
