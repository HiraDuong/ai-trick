// Luvina
// Vu Huy Hoang - Dev2
import "./config/env";
import app from "./app";
import config from "./config/env";
import prisma from "./config/prisma";

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();

    app.listen(config.port, config.host, () => {
      console.log(`Backend server listening on ${config.host}:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start backend server", error);
    process.exit(1);
  }
}

void bootstrap();