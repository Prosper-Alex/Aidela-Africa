// Key feature: Wraps async Express handlers so errors reach the central error middleware.
const asyncHandler = (controller) => (req, res, next) =>
  Promise.resolve(controller(req, res, next)).catch(next);

export default asyncHandler;
