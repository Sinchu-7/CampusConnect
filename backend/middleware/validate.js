const { AppError } = require('../utils/errors');

function validateBody(required, optional = []) {
  const allowed = new Set([...required, ...optional]);
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return next(new AppError(400, 'A JSON object is required.'));
    }
    const unknown = Object.keys(req.body).filter((key) => !allowed.has(key));
    if (unknown.length) return next(new AppError(400, `Unexpected field: ${unknown[0]}`));
    const missing = required.find((key) => req.body[key] === undefined || req.body[key] === '');
    if (missing) return next(new AppError(400, `${missing} is required.`));
    return next();
  };
}

module.exports = { validateBody };
