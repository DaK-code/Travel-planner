const express = require("express");

const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

// PUBLIC ROUTES

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);

router.patch("/resetPassword/:token", authController.resetPassword);

// PROTECTED ROUTES

router.use(authController.protect);

// Update my password
router.patch("/updateMyPassword", authController.updatePassword);

// Current user
router.get("/me", userController.getMe, userController.getUser);

// Update current user
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);

// Delete current user
router.delete("/deleteMe", userController.deleteMe);

// ADMIN ROUTES

router.use(authController.restrictTo("admin"));

// Get all users
router.get("/", userController.getAllUsers);

// Get one user
router.get("/:id", userController.getUser);

// Update another user / change role
router.patch("/:id", userController.updateUser);

// Delete another user
router.delete("/:id", userController.deleteUser);

module.exports = router;
