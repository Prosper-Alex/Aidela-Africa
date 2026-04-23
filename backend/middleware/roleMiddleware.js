import AppError from "../utils/appError.js";
import { normalizeRole } from "../utils/normalizeRole.js";

const authorizeRoles =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Not authorized, user not found", 401));
    }

    const normalizedRole = normalizeRole(req.user.role);

    if (!allowedRoles.includes(normalizedRole)) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }

    req.user.role = normalizedRole;
    next();
  };

const isRecruiter = authorizeRoles("recruiter");
const isJobSeeker = authorizeRoles("jobseeker");

export { authorizeRoles, isRecruiter, isJobSeeker };
