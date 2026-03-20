// Validate required environment variables at startup
const requiredEnvVars = [
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
] as const;

const optionalEnvVars = [
  "REDIS_HOST",
  "REDIS_PORT",
  "CLERK_WEBHOOK_SECRET",
] as const;

export function validateEnv() {
  const missing: string[] = [];
  for (const key of requiredEnvVars) {
    if (!process.env[key]) missing.push(key);
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\nCopy .env.example to .env and fill in the values.`
    );
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379"),
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET || "",
  NODE_ENV: process.env.NODE_ENV || "development",
};
