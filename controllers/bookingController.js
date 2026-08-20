const User = require("../models/userModel");
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const Email = require("../utils/email");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// DEMO PAYMENT PAGE
exports.getPaymentPage = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError("No tour found with that ID.", 404));
  }

  res.status(200).render("payment", {
    title: "Payment",
    tour,
  });
});

// DEMO PAYMENT
exports.processDemoPayment = catchAsync(async (req, res, next) => {
  const { tour } = req.body;

  if (!tour) {
    return next(new AppError("Please provide a tour.", 400));
  }

  // Find tour
  const existingTour = await Tour.findById(tour);

  if (!existingTour) {
    return next(new AppError("No tour found with that ID.", 404));
  }

  // Check if already booked
  const existingBooking = await Booking.findOne({
    tour,
    user: req.user.id,
  });

  if (existingBooking) {
    return next(new AppError("You have already booked this tour.", 400));
  }

  // Create booking using the real price from the database
  const booking = await Booking.create({
    tour: existingTour._id,
    user: req.user.id,
    price: existingTour.price,
    paid: true,
  });

  // Send booking confirmation email
  const user = await User.findById(req.user.id);

  if (user) {
    const url = `${req.protocol}://${req.get("host")}/my-tours`;

    await new Email(user, url).sendBookingConfirmation(existingTour, booking);
  }

  res.status(201).json({
    status: "success",
    message: "Demo payment successful!",
    data: {
      booking,
    },
  });
});

// CREATE BOOKING
exports.createBooking = catchAsync(async (req, res, next) => {
  const { tour } = req.body;

  if (!tour) {
    return next(new AppError("Please provide a tour.", 400));
  }

  const existingTour = await Tour.findById(tour);

  if (!existingTour) {
    return next(new AppError("No tour found with that ID.", 404));
  }

  const existingBooking = await Booking.findOne({
    tour,
    user: req.user.id,
  });

  if (existingBooking) {
    return next(new AppError("You have already booked this tour.", 400));
  }

  const booking = await Booking.create({
    tour: existingTour._id,
    user: req.user.id,
    price: existingTour.price,
    paid: true,
  });

  // Send booking confirmation email
  const user = await User.findById(req.user.id);

  if (user) {
    const url = `${req.protocol}://${req.get("host")}/my-tours`;

    await new Email(user, url).sendBookingConfirmation(existingTour, booking);
  }

  res.status(201).json({
    status: "success",
    data: {
      booking,
    },
  });
});

// GET ALL BOOKINGS
exports.getAllBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find();

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: {
      bookings,
    },
  });
});
