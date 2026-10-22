import { z } from "zod";

const requiredString = z.string({ error: "configuration missing" }).min(1, "configuration missing");
const port = requiredString.pipe(
  z.coerce
    .number<string>({ error: "must be a number" })
    .int("must be an integer")
    .min(1, "must be between 1 and 65535")
    .max(65535, "must be between 1 and 65535"),
);

const envSchema = z.object({
  PORT: port,
  POSTGRES_HOST: requiredString,
  POSTGRES_PORT: port.default(5432),
  POSTGRES_DB: requiredString,
  POSTGRES_USER: requiredString,
  POSTGRES_PASSWORD: requiredString,
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Invalid configuration:\n${z.prettifyError(result.error)}`);
}
const env = result.data;

export const config = {
  port: env.PORT,
  postgres: {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    database: env.POSTGRES_DB,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
  },
};
