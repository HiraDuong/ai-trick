// Luvina
// Vu Huy Hoang - Dev2
import type { HttpError } from "../types/api.types";

export function createHttpError(statusCode: number, message: string): HttpError {
  const error = new Error(message) as HttpError;
  error.statusCode = statusCode;
  return error;
}

export function getErrorResponse(error: unknown): { statusCode: number; message: string } {
  if (error instanceof Error) {
    const httpError = error as HttpError;

    return {
      statusCode: httpError.statusCode ?? 500,
      message: error.message || "Internal server error",
    };
  }

  return {
    statusCode: 500,
    message: "Internal server error",
  };
}