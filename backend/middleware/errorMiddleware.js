// Key feature: Formats application errors into consistent JSON API responses.
import AppError from "../utils/appError.js";

const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || res.statusCode;
  let message = error.message || "Internal server error";
  let errors;

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(error.errors).map((item) => item.message);
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
  } else if (error.code === 11000) {
    statusCode = 409;
    message = `${Object.keys(error.keyValue).join(", ")} already exists`;
  }

  if (!statusCode || statusCode < 400) {
    statusCode = 500;
  }

  const payload = { message };

  if (errors) {
    payload.errors = errors;
  }

  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
};

export { notFound, errorHandler };
