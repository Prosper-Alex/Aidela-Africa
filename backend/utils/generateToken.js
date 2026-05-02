// Key feature: Creates signed JWTs for authenticated API sessions.
import jwt from "jsonwebtoken";

const generateToken = (userId) =>
  jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

export default generateToken;
