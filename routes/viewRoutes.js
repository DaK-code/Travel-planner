const express = require("express");

const viewsController = require("../controllers/viewsController");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");
const userController = require("../controllers/userController");

const router = express.Router();

// Make user available to all views
router.use(authController.isLoggedIn);

// HOME

router.get("/", viewsController.getOverview);

// TOUR

router.get("/tour/:slug", viewsController.getTour);

// AUTH

router.get("/login", viewsController.getLoginForm);

router.get("/signup", viewsController.getSignupForm);

// PAYMENT PAGE

router.get(
  "/payment/:tourId",
  authController.protect,
  bookingController.getPaymentPage,
);

// ACCOUNT

router.get("/me", authController.protect, viewsController.getAccount);

router.get("/my-tours", authController.protect, viewsController.getMyTours);

router.get("/my-reviews", authController.protect, viewsController.getMyReviews);

router.post(
  "/submit-user-data",
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);

module.exports = router;
