const mongoose = require('mongoose');
const Rule = require('./ruleModel');
const AppError = require('../utils/appError');
const transitAirportSchema = new mongoose.Schema(
  {
    airport: {
      type: mongoose.Schema.ObjectId,
      ref: 'Airport',
      require: [true, 'Airport is required.'],
    },
    aircraft: {
      type: mongoose.Schema.ObjectId,
      ref: 'Aircraft',
      require: [true, 'Next aircraft is required.'],
    },
    transitStartTime: {
      type: Date,
      require: [true, 'Start time is required.'],
    },
    transitEndTime: {
      type: Date,
      require: [true, 'End time is required'],
    },
    transitNote: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

transitAirportSchema.virtual('duration').get(function () {
  // Lấy thời gian bắt đầu và kết thúc transit
  const transitStartTime = this.transitStartTime.getTime(); // Chuyển đổi sang milliseconds
  const transitEndTime = this.transitEndTime.getTime(); // Chuyển đổi sang milliseconds

  // Tính hiệu của thời gian kết thúc và bắt đầu transit, sau đó chuyển đổi kết quả thành phút
  const durationInMs = transitEndTime - transitStartTime;
  const durationInMinutes = durationInMs / (1000 * 60); // 1000 milliseconds * 60 seconds

  return durationInMinutes; // Trả về thời gian transit tính theo phút
});

transitAirportSchema.pre(/^find/, function (next) {
  this.populate('airport').populate('aircraft');
  next();
});

// Hook để kiểm tra duration trước khi lưu
transitAirportSchema.pre('save', async function (next) {
  const rule = await Rule.findOne({
    maxTransitTime: { $exists: true },
  });

  if (rule && this.duration > rule.maxTransitTime) {
    return next(
      new AppError(
        'Duration must be less than or equal to max transit time.',
        400,
      ),
    );
  }

  next();
});

module.exports = transitAirportSchema;
