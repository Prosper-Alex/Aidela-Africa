import AppError from "../utils/appError.js";

const authorizeRoles =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Not authorized, user not found", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }

    next();
  };

const isRecruiter = authorizeRoles("recruiter");
const isJobSeeker = authorizeRoles("jobseeker");

export { authorizeRoles, isRecruiter, isJobSeeker };
