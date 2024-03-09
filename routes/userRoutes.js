const express = require('express');
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  logout,
} = require('../controllers/authController');
const passport = require('passport');

const router = express.Router();
//authen
router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword', resetPassword);
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

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

module.exports = router;
