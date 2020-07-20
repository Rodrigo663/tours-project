const express = require('express');
const morgan = require('morgan');
const path = require('path');
const AppError = require('./utils/appError');

const tourRouter = require('./routes/tourRoutes');
const bookRouter = require('./routes/bookingRoutes');

const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const reviewRouter= require('./routes/reviewRoutes');
const errorThrower  = require('./controllers/errorController')

const cookieParser = require('cookie-parser');


const rateLimiter = require('express-rate-limit');
const hpp = require('hpp');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');


const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files

app.use(express.static(path.join(__dirname,  'public')));


// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// This is a MIDDLEWARE, CAN modify the incoming request data.
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());



// PARSING THE DATA COMING FROM SUBMIT 

app.use(express.urlencoded({extended: true, limit:'10kb' }));
// Data sanatization against NoSQL query injection


app.use(mongoSanitize());

// Data Sanatization against XSS

app.use(xss());

// Prevent Parameter Pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));






// Limit requests from the same API
const limiter = rateLimiter({
  // Define how many requests were gonna allow in a certain amount  of time
  max: 100,
  windowMs:  60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);




// Creating our OWN middlewares

// Development Logging

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));

}

// Test middleware
app.use((req, res, next) => {
  req.time = new Date().toISOString();
  next();
});

app.use('/', viewRouter);


app.use(morgan('tiny'));


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Can´t find ${req.originalUrl} on this server`, 404));
});

app.use(errorThrower);
// 4) START THE SERVER

module.exports = app;
