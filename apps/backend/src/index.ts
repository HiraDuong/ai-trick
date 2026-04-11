// Luvina
// Vu Huy Hoang - Dev2
import "./config/env";
import app from "./app";
import config from "./config/env";
import prisma from "./config/prisma";

async function warmUpDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("Backend database connection ready");
  } catch (error) {
    console.error("Backend database warm-up failed", error);
  }
}

function bootstrap(): void {
  try {
    console.log("Starting server...");
    console.log("PORT:", process.env.PORT ?? String(config.port));

    const server = app.listen(config.port, "0.0.0.0", () => {
      console.log("Server started");
      console.log(`Backend server listening on 0.0.0.0:${config.port}`);
      void warmUpDatabase();
    });

    server.on("error", (error) => {
      console.error("Failed to start backend server", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start backend server", error);
    process.exit(1);
  }
}

bootstrap();