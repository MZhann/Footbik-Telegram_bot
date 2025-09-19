// src/middleware/error.js
function notFound(req, res, next) {
  res.status(404).json({ message: 'Route not found' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  // Invalid ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // Duplicate key (e.g., email unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `Duplicate ${field}: ${err.keyValue[field]}` });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
}

module.exports = { notFound, errorHandler };
