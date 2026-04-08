// Luvina
// Vu Huy Hoang - Dev2
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const rootEnvPath = path.join(repoRoot, ".env");
const rootEnvExamplePath = path.join(repoRoot, ".env.example");
const infraDir = path.join(repoRoot, "infra");
const backendDir = path.join(repoRoot, "apps", "backend");
const frontendDir = path.join(repoRoot, "apps", "frontend");

const childProcesses = [];
let isShuttingDown = false;

function ensureRootEnvFile() {
  if (fs.existsSync(rootEnvPath)) {
    return;
  }

  fs.copyFileSync(rootEnvExamplePath, rootEnvPath);
  console.log("[startup] Created .env from .env.example");
}

function parseEnvFile(filePath) {
  const env = {};
  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

function buildRuntimeEnv() {
  ensureRootEnvFile();

  const fileEnv = parseEnvFile(rootEnvPath);
  const backendPort = fileEnv.PORT || process.env.PORT || "5000";
  const frontendPort = fileEnv.FRONTEND_PORT || process.env.FRONTEND_PORT || "3000";
  const apiBaseUrl = fileEnv.API_BASE_URL || process.env.API_BASE_URL || `http://localhost:${backendPort}/api`;
  const corsOrigin = fileEnv.CORS_ORIGIN || process.env.CORS_ORIGIN || `http://localhost:${frontendPort}`;

  return {
    ...process.env,
    ...fileEnv,
    PORT: backendPort,
    FRONTEND_PORT: frontendPort,
    API_BASE_URL: apiBaseUrl,
    NEXT_PUBLIC_API_BASE_URL: fileEnv.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || apiBaseUrl,
    CORS_ORIGIN: corsOrigin,
  };
}

function prefixStream(stream, prefix) {
  let buffer = "";

  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.length > 0) {
        console.log(`${prefix} ${line}`);
      }
    }
  });

  stream.on("end", () => {
    if (buffer.length > 0) {
      console.log(`${prefix} ${buffer}`);
      buffer = "";
    }
  });
}

function runCommand(commandLine, options = {}) {
  const child = spawn(commandLine, {
    shell: true,
    windowsHide: false,
    ...options,
  });

  childProcesses.push(child);
  return child;
}

function waitForPort(host, port, timeoutMs) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    function attempt() {
      const socket = net.createConnection({ host, port: Number(port) });
      let settled = false;

      socket.setTimeout(1500);

      socket.on("connect", () => {
        settled = true;
        socket.end();
        resolve();
      });

      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }

        setTimeout(attempt, 1000);
      });

      socket.on("timeout", () => {
        socket.destroy();
        if (!settled) {
          if (Date.now() - startedAt >= timeoutMs) {
            reject(new Error(`Timed out waiting for ${host}:${port}`));
            return;
          }

          setTimeout(attempt, 1000);
        }
      });
    }

    attempt();
  });
}

function stopAll(exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log("[startup] Shutting down child processes...");

  for (const child of childProcesses) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }

  setTimeout(() => {
    process.exit(exitCode);
  }, 500);
}

async function main() {
  const runtimeEnv = buildRuntimeEnv();

  console.log("[startup] Starting PostgreSQL container...");
  const dockerResult = spawnSync("docker compose up -d", {
    cwd: infraDir,
    env: runtimeEnv,
    shell: true,
    stdio: "inherit",
  });

  if (dockerResult.status !== 0) {
    throw new Error("Docker compose startup failed");
  }

  console.log(`[startup] Waiting for PostgreSQL on localhost:${runtimeEnv.POSTGRES_PORT || "5432"}...`);
  await waitForPort("127.0.0.1", runtimeEnv.POSTGRES_PORT || "5432", 60000);

  console.log("[startup] Starting backend...");
  const backendProcess = runCommand("npm run dev:unified", {
    cwd: backendDir,
    env: runtimeEnv,
  });
  prefixStream(backendProcess.stdout, "[backend]");
  prefixStream(backendProcess.stderr, "[backend]");

  console.log(`[startup] Waiting for backend on localhost:${runtimeEnv.PORT}...`);
  await waitForPort("127.0.0.1", runtimeEnv.PORT, 60000);

  console.log("[startup] Starting frontend...");
  const frontendProcess = runCommand("npm run dev", {
    cwd: frontendDir,
    env: {
      ...runtimeEnv,
      PORT: runtimeEnv.FRONTEND_PORT,
    },
  });
  prefixStream(frontendProcess.stdout, "[frontend]");
  prefixStream(frontendProcess.stderr, "[frontend]");

  console.log(`[startup] Frontend expected at http://localhost:${runtimeEnv.FRONTEND_PORT}`);

  backendProcess.on("exit", (code) => {
    if (!isShuttingDown) {
      console.error(`[startup] Backend exited with code ${code ?? 0}`);
      stopAll(1);
    }
  });

  frontendProcess.on("exit", (code) => {
    if (!isShuttingDown) {
      console.error(`[startup] Frontend exited with code ${code ?? 0}`);
      stopAll(1);
    }
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

main().catch((error) => {
  console.error(`[startup] ${error.message}`);
  stopAll(1);
});