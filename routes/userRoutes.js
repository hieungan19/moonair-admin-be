const express = require('express');
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  logout,
  restrictTo,
  checkResetPassword,

  googleLogin,
} = require('../controllers/authController');
const {
  getMe,
  getUser,
  getAllUsers,
  updateUserData,
} = require('../controllers/userController');
const passport = require('passport');

const router = express.Router();
//authen
router.post('/signup', signUp);
router.post('/login', login);
router.post('/gglogin', googleLogin);
router.post('/forgotPassword', forgotPassword);
router.post('/checkResetPassword', checkResetPassword);
router.patch('/resetPassword', resetPassword);

// router.get(
//   '/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] }),
// );

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: 'https://www.google.com',
    failureRedirect: 'http://localhost:3001/login',
  }),
);

// phai dang nhap moi thuc hien duoc
router.use(protect);
router.get('/logout', logout);
router.patch('/updatePassword', updatePassword);

// user
router.get('/me', getMe, getUser);
router.patch('/updateData', updateUserData);

// admin
router.use(restrictTo('admin'));
router.route('/').get(getAllUsers);
module.exports = router;
