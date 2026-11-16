const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../utils/errors');

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies.campusconnect_token;
  if (!token) throw new AppError(401, 'Please sign in to continue.');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError(401, 'Your session is invalid or has expired.');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.active) throw new AppError(401, 'Your account is unavailable.');
  req.user = user;
  next();
});

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to perform this action.'));
    }
    return next();
  };
}

module.exports = { authenticate, allowRoles };
