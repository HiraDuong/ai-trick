// Luvina
// Vu Huy Hoang - Dev2
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigin: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

function readRequiredString(value: string | undefined, variableName: string): string {
  if (!value || !value.trim()) {
    throw new Error(`${variableName} is required`);
  }

  return value.trim();
}

function readJwtSecret(value: string | undefined, nodeEnv: string): string {
  const secret = readRequiredString(value, "JWT_SECRET");

  if (secret.length < 16) {
    throw new Error("JWT_SECRET must be at least 16 characters long");
  }

  if (nodeEnv === "production" && secret === "change-me") {
    throw new Error("JWT_SECRET must be changed before running in production");
  }

  return secret;
}

function readJwtExpiration(value: string | undefined): string {
  const expiresIn = readRequiredString(value, "JWT_EXPIRES_IN");

  if (!/^\d+[smhd]$/.test(expiresIn)) {
    throw new Error("JWT_EXPIRES_IN must use a compact duration such as 15m, 12h, or 7d");
  }

  return expiresIn;
}

const nodeEnv = process.env.NODE_ENV ?? "development";

const config: AppConfig = {
  nodeEnv,
  port: Number(process.env.PORT ?? 5000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  databaseUrl: readRequiredString(process.env.DATABASE_URL, "DATABASE_URL"),
  jwtSecret: readJwtSecret(process.env.JWT_SECRET ?? "change-me", nodeEnv),
  jwtExpiresIn: readJwtExpiration(process.env.JWT_EXPIRES_IN ?? "7d"),
};

export default config;