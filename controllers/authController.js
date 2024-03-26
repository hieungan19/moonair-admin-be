const { promisify } = require('util');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
// const { sendEmail } = require('../utils/email');
const Email = require('../utils/email');

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  console.log('Sign Up', req);
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log('URL: ' + url);
  const email = new Email(newUser, url);
  await email.sendWelcome();
  createAndSendToken(newUser, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // get token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies) {
    console.log(req.cookies);
    token = req.cookies.jwt;
  }
  // console.log('TOKEN: ', token);

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401),
    );
  }

  //2. verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log('AFTER DECODE: ', decoded);

  //3. Check if user still exist (nếu 1 tài khoản đăng nhập và lấy được token nhưng 1 thiết bị khác lại xóa tài khoản đó đi thì không thể nào xử lí trên token cũ đó được nữa)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The token beloging to this user does no longer exist. ',
        401,
      ),
    );
  }

  // 4. check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password!. Please login again. ',
        401,
      ),
    );
  }

  //grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // get token and check of it's there
  let token;
  if (req.cookies.jwt) {
    console.log(req.cookies);
    token = req.cookies.jwt;
    //2. verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log('AFTER DECODE: ', decoded);

    //3. Check if user still exist (nếu 1 tài khoản đăng nhập và lấy được token nhưng 1 thiết bị khác lại xóa tài khoản đó đi thì không thể nào xử lí trên token cũ đó được nữa)
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // 4. check if user changed password after the token was issued
    if (currentUser.changePasswordAfter(decoded.iat)) {
      return next();
    }

    //grant access to protected route
    res.locals.user = currentUser;
    return next();
  }
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1. check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  //2. check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  const correct = await user.correctPassword(password, user.password);
  if (!user || !correct) {
    return next(new AppError('Incorrect email or password'), 401);
  }

  //3. ok
  createAndSendToken(user, 200, res);
});

exports.restrictTo = (...roles) => {
  console.log(roles);
  return (req, res, next) => {
    //roles is an array ['admin', 'lead-guide']
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action.'),
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetPass = user.createPasswordReset();
  await user.save();

  //3. send it to user's email

  try {
    await new Email(user, resetPass).sendForgotPasswordUrl();
    res.status(200).json({
      status: 'success',
      message: 'New password sent to email',
    });
  } catch (err) {
    console.log('Error when sent email:', err);
    user.passwordReset = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the mail. Try again later'),
    );
  }
});

exports.resetPassword = async function (req, res, next) {
  const user = await User.findOne({
    passwordReset: req.body.resetPassword,
    email: req.body.email,
  });

  //2. If token has not expired, there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordReset = undefined;
  await user.save();

  //3. Update changedPasswordAt
  //4. Log the user in, send JWT
  createAndSendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {
  const user = await User.findById({ _id: req.user.id }).select('+password');

  console.log(user);
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(AppError('Your current password is wrong. ', 400));
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //user find by id and update will not work as intended.

  createAndSendToken(user, 200, res);
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'success',
    data: 'null',
  });
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'empty', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.loginSucess = async (req, res) => {
  if (req.user) {
    res.status(200).json({ message: 'user Login', user: req.user });
  } else {
    res.status(400).json({ message: 'Not Authorized' });
  }
};

exports.loginWithGG = async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        image: profile.photos[0].value,
        role: 'user',
      });

      await user.save();
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
};
