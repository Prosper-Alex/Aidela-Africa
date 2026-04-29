import rateLimit from "express-rate-limit";

// Limits repeated auth requests from the same client.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many password reset attempts. Please try again later.",
  },
});
