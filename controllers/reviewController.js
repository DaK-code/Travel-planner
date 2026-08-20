const Review = require("../models/reviewModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// SET TOUR AND USER IDS

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }

  req.body.user = req.user.id;

  next();
};

// GET ALL REVIEWS

exports.getAllReviews = catchAsync(async (req, res) => {
  let filter = {};

  if (req.params.tourId) {
    filter = {
      tour: req.params.tourId,
    };
  }

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// CREATE REVIEW

exports.createReview = catchAsync(async (req, res, next) => {
  const booking = await Booking.findOne({
    user: req.user.id,
    tour: req.body.tour,
  });

  if (!booking) {
    return next(
      new AppError("You can only review a tour that you have booked.", 403),
    );
  }

  req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      review: newReview,
    },
  });
});

// UPDATE REVIEW

exports.updateReview = catchAsync(async (req, res, next) => {
  delete req.body.user;
  delete req.body.tour;

  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("No review found with that ID.", 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new AppError("You are not allowed to update this review.", 403),
    );
  }

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: "success",
    data: {
      review: updatedReview,
    },
  });
});

// DELETE REVIEW

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("No review found with that ID.", 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new AppError("You are not allowed to delete this review.", 403),
    );
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
