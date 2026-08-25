const express = require("express");

const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

const router = express.Router();

// PROTECT ALL BOOKING ROUTES

router.use(authController.protect);

// STRIPE CHECKOUT

router.get("/payment/:tourId", bookingController.getPaymentPage);

router.post("/payment", bookingController.createCheckoutSession);

router.get("/checkout-success", bookingController.createBookingCheckout);

// ADMIN / LEAD GUIDE

router.use(authController.restrictTo("admin", "lead-guide"));

router.get("/", bookingController.getAllBookings);

router
  .route("/:id")
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
