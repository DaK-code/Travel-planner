const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const userRouter = require("./routes/userRoutes");
const tourRouter = require("./routes/tourRoutes");
const viewRouter = require("./routes/viewRoutes");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// GLOBAL CONFIGURATION

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// STATIC FILES

app.use(express.static(path.join(__dirname, "public")));

// SECURITY

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// LOGGING

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// RATE LIMITING

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

// BODY PARSERS

app.use(
  express.json({
    limit: "10kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);

// COOKIE PARSER

app.use(cookieParser());

// EXPRESS 5 COMPATIBILITY
//
// Express 5 exposes req.query as a read-only getter.
// The sanitization middlewares used by this project
// need to modify req.query.
//
// We create a writable copy before those middlewares run.

app.use((req, res, next) => {
  Object.defineProperty(req, "query", {
    ...Object.getOwnPropertyDescriptor(req, "query"),
    value: req.query,
    writable: true,
  });

  next();
});

// DATA SANITIZATION

// Prevent NoSQL injection
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// HTTP PARAMETER POLLUTION

app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

// ROUTES

app.use("/", viewRouter);

app.use("/api/v1/tours", tourRouter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/reviews", reviewRouter);

app.use("/api/v1/bookings", bookingRouter);

// NON-EXISTENT ROUTES

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLER

app.use(globalErrorHandler);

module.exports = app;
