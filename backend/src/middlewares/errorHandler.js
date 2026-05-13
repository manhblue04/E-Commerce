const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err.message, err.stack?.split('\n')[1]?.trim())
  }

  let statusCode = err.status || err.statusCode || 500
  let message = err.message || 'Lỗi máy chủ nội bộ'

  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Dữ liệu không hợp lệ'
  }

  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue)[0]
    message = `${field} đã tồn tại`
  }

  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ')
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Token không hợp lệ'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token đã hết hạn'
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

module.exports = errorHandler
