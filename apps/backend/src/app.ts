// Luvina
// Vu Huy Hoang - Dev2
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import apiRouter from "./routes";
import config from "./config/env";
import type { ApiErrorResponse, ApiSuccessResponse } from "./types/api.types";
import { getErrorResponse } from "./utils/error.utils";

interface RootResponseDto {
  name: string;
  version: string;
}

interface HealthLikeErrorResponse extends ApiErrorResponse {}

const app = express();

const allowAllCorsOrigins = config.corsOrigins.includes("*");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowAllCorsOrigins || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
  })
);
app.use(express.json());

app.get(
  "/",
  (_request: Request, response: Response<ApiSuccessResponse<RootResponseDto>>) => {
    response.status(200).json({
      success: true,
      data: {
        name: "Internal Knowledge Sharing Platform API",
        version: "1.0.0",
      },
    });
  }
);

app.use("/api", apiRouter);

app.use((_request: Request, response: Response<HealthLikeErrorResponse>) => {
  response.status(404).json({
    success: false,
    error: {
      message: "Route not found",
    },
  });
});

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response<HealthLikeErrorResponse>,
    _next: NextFunction
  ) => {
    const { statusCode, message } = getErrorResponse(error);

    response.status(statusCode).json({
      success: false,
      error: {
        message,
      },
    });
  }
);

export default app;