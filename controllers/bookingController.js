const User = require("../models/userModel");
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const factory = require("../utils/handlerFactory");
const Email = require("../utils/email");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// PAYMENT PAGE

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

// CREATE STRIPE CHECKOUT SESSION

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { tour } = req.body;

  // We only accept the tour ID from the client.
  // The price is ALWAYS retrieved from MongoDB.
  if (!tour) {
    return next(new AppError("Please provide a tour.", 400));
  }

  const existingTour = await Tour.findById(tour);

  if (!existingTour) {
    return next(new AppError("No tour found with that ID.", 404));
  }

  // Check if the user already booked this tour.
  const existingBooking = await Booking.findOne({
    tour: existingTour._id,
    user: req.user.id,
  });

  if (existingBooking) {
    return next(new AppError("You have already booked this tour.", 400));
  }

  // Create Stripe Checkout Session.
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    success_url: `${req.protocol}://${req.get(
      "host",
    )}/api/v1/bookings/checkout-success?session_id={CHECKOUT_SESSION_ID}`,

    cancel_url: `${req.protocol}://${req.get(
      "host",
    )}/tour/${existingTour.slug}`,

    customer_email: req.user.email,

    client_reference_id: req.user.id.toString(),

    metadata: {
      tourId: existingTour._id.toString(),
      userId: req.user.id.toString(),
    },

    line_items: [
      {
        price_data: {
          currency: "usd",

          product_data: {
            name: existingTour.name,
            description: existingTour.summary,
          },

          // IMPORTANT:
          // The price comes from MongoDB, NOT from req.body.
          unit_amount: Math.round(existingTour.price * 100),
        },

        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: "success",
    sessionUrl: session.url,
  });
});

// STRIPE CHECKOUT SUCCESS

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { session_id: sessionId } = req.query;

  if (!sessionId) {
    return next(new AppError("Missing Stripe session ID.", 400));
  }

  // Retrieve the Stripe Checkout Session.
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // Make sure the payment was actually completed.
  if (session.payment_status !== "paid") {
    return next(new AppError("Payment was not completed.", 400));
  }

  const tourId = session.metadata.tourId;
  const userId = session.metadata.userId;

  if (!tourId || !userId) {
    return next(new AppError("Invalid Stripe session metadata.", 400));
  }

  // Prevent duplicate bookings.
  const existingBooking = await Booking.findOne({
    tour: tourId,
    user: userId,
  });

  if (existingBooking) {
    return res.redirect("/my-tours");
  }

  // Retrieve the tour from the database.
  const tour = await Tour.findById(tourId);

  if (!tour) {
    return next(
      new AppError("Tour associated with this payment was not found.", 404),
    );
  }

  // Create booking.
  // The price ALWAYS comes from MongoDB.
  const booking = await Booking.create({
    tour: tour._id,
    user: userId,
    price: tour.price,
    paid: true,
  });

  // Send confirmation email.
  const user = await User.findById(userId);

  if (user) {
    const url = `${req.protocol}://${req.get("host")}/my-tours`;

    await new Email(user, url).sendBookingConfirmation(tour, booking);
  }

  // Redirect user to their bookings.
  res.redirect("/my-tours");
});

// GET ALL BOOKINGS

exports.getAllBookings = factory.getAll(Booking);

// GET ONE BOOKING

exports.getBooking = factory.getOne(Booking);

// UPDATE BOOKING

exports.updateBooking = factory.updateOne(Booking);

// DELETE BOOKING

exports.deleteBooking = factory.deleteOne(Booking);
