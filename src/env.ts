import { config } from "dotenv";

if (process.env.NODE_ENV !== "production") config();

export function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export function getOptionalEnvVariable<T = undefined>(
  key: string,
  defaultValue: T = undefined as unknown as T
): string | T {
  return process.env[key] || defaultValue;
}
