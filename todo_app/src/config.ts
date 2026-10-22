function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} configuration missing`);
  return value;
}

function requiredNumber(name: string): number {
  const value = Number(required(name));
  if (!Number.isFinite(value)) throw new Error(`${name} must be a number`);
  return value;
}

export const config = {
  port: requiredNumber("PORT"),
  imageDir: required("IMAGE_DIR"),
  imageMaxAgeMs: requiredNumber("IMAGE_MAX_AGE_MS"),
  imageSourceUrl: required("IMAGE_SOURCE_URL"),
  // Only for local development, in the cluster the Ingress routes /todos to todo-backend
  todoBackendUrl: process.env.TODO_BACKEND_URL,
};
