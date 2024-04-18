const mongoose = require('mongoose');
const transitAirportSchema = new mongoose.Schema({
  airportId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Airport',
    require: [true, 'Airport is required.'],
  },
  aircraftId: {
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
});

transitAirportSchema.virtual('duration').get(function () {
  // Lấy thời gian bắt đầu và kết thúc transit
  const transitStartTime = this.transitStartTime.getTime(); // Chuyển đổi sang milliseconds
  const transitEndTime = this.transitEndTime.getTime(); // Chuyển đổi sang milliseconds

  // Tính hiệu của thời gian kết thúc và bắt đầu transit, sau đó chuyển đổi kết quả thành phút
  const durationInMs = transitEndTime - transitStartTime;
  const durationInMinutes = durationInMs / (1000 * 60); // 1000 milliseconds * 60 seconds

  return durationInMinutes; // Trả về thời gian transit tính theo phút
});

module.exports = transitAirportSchema;
