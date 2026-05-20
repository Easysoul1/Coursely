import winston from "winston";

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === "production"
      ? winston.format.json()
      : winston.format.combine(winston.format.colorize(), winston.format.simple()),
  ),
  defaultMeta: { service: "coursely-api" },
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === "production"
      ? [new winston.transports.File({ filename: "logs/error.log", level: "error" })]
      : []),
  ],
});

export default logger;
