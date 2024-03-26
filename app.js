const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
const userRouter = require('./routes/userRoutes');
const airportRouter = require('./routes/airportRoutes');
const { loginWithGG } = require('./controllers/authController');
const AppError = require('./utils/appError');
const aircraftRouter = require('./routes/aircraftRoutes');
//Middleware
app.use(
  cors({
    origin: 'http://localhost:3001',
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,
  }),
);
app.use(express.json({ limit: '10kb' }));
// setup session
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  }),
);

// setuppassport
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GG_CLIENT_ID,
      clientSecret: process.env.GG_CLIENT_SECRET,
      callbackURL: '/api/v1/users/auth/google/callback',
      scope: ['profile', 'email'],
    },
    loginWithGG,
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

//Routes

app.use('/api/v1/users', userRouter);
app.use('/api/v1/airports', airportRouter);
app.use('/api/v1/aircrafts', aircraftRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;
