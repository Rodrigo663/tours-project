const appError = require('.././utils/appError');
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: is ${err.value}`;
  return new appError(message, 400);
};
const handleJWTError = () =>
  new appError(`Invalid token! Please log in again!`, 401);
const handleTokenExpiredError = () =>
  new appError(`This token have already expired!! Please log in again!`, 401);
const handleDuplicateFields = (err) => {
  const message = `Duplicated field: ${err.keyValue.name}`;
  return new appError(message, 400);
};
const handleValidationError = (err) => {
  const keys = Object.values(err.errors).map((el) => {
    return el.message;
  });
  const message = `${keys.join(' ')}`;
  return new appError(message, 400);
};
const sendErrorForDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
  // RENDERED WEBSITE

  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: err.message,
  });
};
const sendErrorForProd = (err, req, res) => {
  /////////////////////////////////////////
  ///////   ERROR IN OUR API

  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client

    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Programming error or unkown error: don´t leak error details

    // 1) Log error
    console.error('ERROR 😢', err);
    // 2) Send generic message

    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
      err,
    });
  }

  /////////////////////////////////////////
  ///////  ERROR IN OUR RENDERED WEBPAGE

  // A) - Operational, trusted error: send message to client

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message,
    });
  }


  

  // B) - Programming error or unkown error: don´t leak error details

  // 1) Log error
  console.error('ERROR 😢', err);
  // 2) Send generic message

  return res.status(err.statusCode).render('error', {
    title: 'something went very wrong! ',
    msg: 'Try again later!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = {...err}
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);

    if (error.code === 11000) error = handleDuplicateFields(error);

    if (err._message === 'Validation failed')
      error = handleValidationError(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(error);

    if (err.name === 'TokenExpiredError')
      error = handleTokenExpiredError(error);

    sendErrorForProd(error, req, res);
  }
};
