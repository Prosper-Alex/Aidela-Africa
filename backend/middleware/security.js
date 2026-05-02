// Key feature: Applies HTTP security headers, sanitization, and request hardening.
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

// Adds basic HTTP protection headers and blocks MongoDB operator injection.
export const applySecurity = (app) => {
  app.use(helmet());
  app.use(mongoSanitize());
};
