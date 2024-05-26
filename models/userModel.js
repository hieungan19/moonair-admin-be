const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcrypt');
function validatePhoneNumber(value) {
  const phoneNumberRegex = /^\d+$/; // Biểu thức chính quy để kiểm tra số
  return phoneNumberRegex.test(value);
}

const userSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: true,
    selected: false,
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    validate: [validator.isEmail, 'Please provide a vaid email'],
    unique: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: validatePhoneNumber,
      message: 'Phone number must contain only digits',
    },
    // required: [true, 'Please provide phone number'],
  },
  photo: { type: String, default: 'default.jpg' },
  password: {
    type: String,
    // required: [true, 'Please provide password'],
    minlength: 8,
    maxlength: 16,
    select: false,
  },
  passwordConfirm: {
    type: String,
    // required: [true, 'Please confirm your Password'],

    // This only work on create and save
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Invalid confirm password',
    },
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  googleId: String,
  passwordChangeAt: Date,
  passwordReset: String,
  passwordResetExpires: Date,
  dob: Date,
  country: String,
  gender: String,
});
// middle
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  // phải trừ 1s là do sẽ tạo ra token trước khi Date.now() được gọi ở trigger này.Để đảm bảo token được tạo sau khi đổi password thì phải lùi về 1s trước.
  next();
});

userSchema.pre('save', async function (next) {
  // only run this func if pass was modified
  // console.log('PRE: SAVE CALL');
  if (!this.isModified('password')) return next();
  // hash password with cost of 12
  this.password = await bcryptjs.hash(this.password, 10);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  console.log(candidatePassword, userPassword);
  return await bcryptjs.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function () {
  userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    let changedTimestamp;
    if (this.passwordChangeAt) {
      changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
      console.log(this.passwordChangeAt, JWTTimestamp);
    }
    return JWTTimestamp < changedTimestamp;
  };

  // 200 < 300 (tgian lấy token bé hơn thời gian đổi mật khẩu -> sau khi lấy token mới đổi mk )
  // 300 > 200 ( false -> notchange )
};

userSchema.methods.createPasswordReset = function () {
  const resetPass = Math.floor(100000 + Math.random() * 900000).toString();

  this.passwordReset = resetPass;
  console.log('Reset pass: ', resetPass);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetPass;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
