
export const catchAsync = (fn, message) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      err.customMessage = err.message ?? message;
      next(err);
    });
  };
};
