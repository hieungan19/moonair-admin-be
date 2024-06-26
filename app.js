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
const ticketClassRouter = require('./routes/ticketClassRoutes');
const flightsRouter = require('./routes/flightRoutes');
const ruleRouter = require('./routes/ruleRoutes');
const invoiceRouter = require('./routes/buyTicketRoutes');
const historyRouter = require('./routes/historyTicketRoutes');
const reportRouter = require('./routes/reportRoutes');
const globalErrorHandler = require('./handlers/errorHandler');
//Middleware
// Sử dụng middleware CORS
app.use(cors());

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
app.use('/api/v1/rule', ruleRouter);
app.use('/api/v1/airports', airportRouter);
app.use('/api/v1/aircrafts', aircraftRouter);
app.use('/api/v1/ticketClasses', ticketClassRouter);
app.use('/api/v1/flights', flightsRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1/history', historyRouter);
app.use('/api/v1/report', reportRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.get('/', (req, res) => {
  res.json({ message: 'Hello from backend' });
});

app.use(globalErrorHandler);

module.exports = app;
