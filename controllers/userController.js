const User = require('./../models/userModel');
const factory = require('./../handlers/factoryHandler');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
exports.getAllUsers = factory.getAll(User);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not yet defined',
  });
};
exports.updateUserData = catchAsync(async (req, res, next) => {
  if (
    req.body.currentPassword ||
    req.body.newPassword ||
    req.body.password ||
    req.body.passwordConfirm
  ) {
    return next(
      new AppError(
        'This route is not for password update. Please use /updatePassword',
        400,
      ),
    );
  }

  const updateUser = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      updateUser,
    },
  });
});

exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getOneById(User);
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
