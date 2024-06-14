const sendErrorDev = (err, req, res) => {
  // console.log(err.stack);
  console.log(req.originalUrl);
  // api
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      error: err,
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //web
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong.',
      msg: err.message,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  sendErrorDev(err, req, res);
};
