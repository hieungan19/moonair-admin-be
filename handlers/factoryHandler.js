const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeature = require('../utils/apiFeatures');
exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const item = await Model.findByIdAndDelete(req.params.id);

    if (!item) {
      return next(new AppError('No item found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: null,
    });
  });
};
exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    if (!data) return next(new AppError('No item found with that ID', 404));

    res.status(200).json({
      status: 'success',
      data,
    });
  });
};

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.create(req.body);
    if (!data) {
      return next(new AppError('Fail to create', 400));
    }
    res.status(200).json({
      status: 'success',
      data,
    });
  });
exports.getOneById = (Model, populatOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populatOptions) query = query.populate(populatOptions);
    const data = await query;
    if (!data) {
      return next(new AppError('No item found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data,
    });
  });
};

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    const features = new APIFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .pagination();
    const doc = await features.query; //.explain
    if (!doc) return next(new AppError('Error when get all', 500));
    res.status(200).json({
      status: 'success',
      length: doc.length,
      doc,
    });
  });

exports.createCode = (id) => {
  if (!id) {
    throw new Error('ID không được để trống');
  }

  // Chuyển đổi ID thành mã hex
  const hexString = id.toString();

  // Tạo mã code từ hexString
  let code = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charLength = characters.length;
  const hexStringLength = hexString.length;
  for (let i = 0; i < 6; i++) {
    // Sử dụng phép tính modulo để lấy giá trị ký tự từ hexString
    const index = parseInt(hexString[i % hexStringLength], 16) % charLength;
    code += characters[index];
  }

  return code;
};

// Tạo mã thành phố
exports.createCityCode = (city) => {
  const words = city?.split(' ');
  let cityCode = '';
  words?.forEach((word) => {
    cityCode += word.charAt(0);
  });
  return cityCode.toUpperCase();
};
