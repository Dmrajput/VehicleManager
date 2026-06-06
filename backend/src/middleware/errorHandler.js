const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  // Only log full stack traces for real server errors. Client errors like 404s
  // are expected and would otherwise spam the logs with scary stack traces.
  if (statusCode >= 500) {
    console.error(err);
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn(`${statusCode} ${req.method} ${req.originalUrl} - ${err.message}`);
  }
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
  });
};

module.exports = { notFound, errorHandler };
