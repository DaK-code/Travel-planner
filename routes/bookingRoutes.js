const express = require("express");

const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

const router = express.Router();

// PROTECT ALL BOOKING ROUTES

router.use(authController.protect);

// DEMO PAYMENT

router.get("/payment/:tourId", bookingController.getPaymentPage);

router.post("/payment", bookingController.processDemoPayment);

// ADMIN / LEAD GUIDE

router.use(authController.restrictTo("admin", "lead-guide"));

router.get("/", bookingController.getAllBookings);

module.exports = router;
