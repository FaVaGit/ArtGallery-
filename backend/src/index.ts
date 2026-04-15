import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { driveRouter } from "./routes/driveRoutes.js";
import { HttpError } from "./utils/httpError.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "artgallery-backend" });
});

app.use("/api/drive", driveRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof HttpError) {
    return res.status(error.status).json({
      error: error.message,
    });
  }

  const message = error instanceof Error ? error.message : "Unknown server error";

  return res.status(500).json({
    error: message,
  });
});

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
