import "dotenv/config";

import app from "./src/app.js";
import { worker, connection } from "./src/workers/document.worker.js";

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log("API + BullMQ worker running in the same process");
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  try {
    // Stop accepting new HTTP requests
    await new Promise((resolve) => {
      server.close(resolve);
    });

    console.log("HTTP server closed");

    // Stop BullMQ worker
    await worker.close();

    console.log("BullMQ worker closed");

    // Close Redis connection
    await connection.quit();

    console.log("Valkey connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Shutdown error:", error);

    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
