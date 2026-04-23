const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose CastError
  if (err.name === 'CastError') {
    error = new ApiError(400, `Буруу ID формат: ${err.value}`);
  }
  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, messages.join(', '));
  }
  // MongoDB Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(409, `${field} аль хэдийн бүртгэлтэй байна.`);
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError') error = new ApiError(401, 'Токен хүчингүй байна.');
  if (err.name === 'TokenExpiredError') error = new ApiError(401, 'Токений хугацаа дууссан.');

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Серверийн алдаа гарлаа.';

  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${req.method} ${req.url} — ${message}`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(error.errors?.length && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
