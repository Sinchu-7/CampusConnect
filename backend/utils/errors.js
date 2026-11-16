class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || (error.type === 'entity.parse.failed' || error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);
  const message = status === 500 ? 'An unexpected server error occurred.' : error.type === 'entity.parse.failed' ? 'Request body must contain valid JSON.' : error.message;
  if (status === 500) console.error(error);
  res.status(status).json({ error: message });
}

module.exports = { AppError, asyncHandler, errorHandler };
