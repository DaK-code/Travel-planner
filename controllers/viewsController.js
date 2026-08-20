const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// HOME PAGE
exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

// TOUR DETAILS PAGE
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({
    slug: req.params.slug,
  }).populate({
    path: "reviews",
    select: "review rating user",
  });

  if (!tour) {
    return next(new AppError("There is no tour with that name.", 404));
  }

  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});

// LOGIN PAGE
exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};

// SIGNUP PAGE
exports.getSignupForm = (req, res) => {
  res.status(200).render("signup", {
    title: "Create your account",
  });
};

// USER PROFILE PAGE
exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};

// MY BOOKINGS PAGE
exports.getMyTours = catchAsync(async (req, res) => {
  const bookings = await Booking.find({
    user: req.user._id,
  });

  const tourIDs = bookings.map((el) => el.tour);

  const tours = await Tour.find({
    _id: { $in: tourIDs },
  });

  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
});

// MY REVIEWS PAGE
exports.getMyReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({
    user: req.user._id,
  }).populate({
    path: "tour",
    select: "name slug imageCover",
  });

  res.status(200).render("myReviews", {
    title: "My Reviews",
    reviews,
  });
});
