// Key feature: Verifies JWTs and attaches the authenticated user to each request.
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    throw new AppError("Not authorized, token missing", 401);
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    // Verify the JWT before loading the user so invalid requests fail cheaply.
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Not authorized, token expired", 401);
    }

    throw new AppError("Not authorized, invalid token", 401);
  }

  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError("Not authorized, user not found", 401);
  }

  if (
    user.passwordChangedAt &&
    decodedToken.iat &&
    Math.floor(user.passwordChangedAt.getTime() / 1000) > decodedToken.iat
  ) {
    // Reject old tokens after a password reset or password change.
    throw new AppError("Not authorized, password was changed. Please log in again.", 401);
  }

  req.user = user;
  next();
});

export { protect };
export default protect;
