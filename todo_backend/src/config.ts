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
};
