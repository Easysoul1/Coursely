import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors";
import { ZodError } from "zod";
import logger from "../lib/logger";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    logger.warn({ code: err.code, statusCode: err.statusCode, message: err.message });
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn("Validation error", { errors: err.errors });
    res.status(400).json({
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.errors,
      },
    });
    return;
  }

  logger.error("Unhandled error:", err);
  res.status(500).json({
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  });
}
