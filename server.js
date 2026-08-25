const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/userModel");

// UNCAUGHT EXCEPTION

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err);
  process.exit(1);
});

// ENVIRONMENT VARIABLES

dotenv.config({
  path: "./config/config.env",
});

const app = require("./app");

// DATABASE

const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then(() => {
    console.log("DB connection successful!");
  })
  .catch((err) => {
    console.log("DATABASE CONNECTION ERROR!");
    console.log(err);
  });
// SERVER

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// UNHANDLED REJECTION

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});

// SIGTERM

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED. Shutting down gracefully...");

  server.close(() => {
    console.log("Process terminated!");
  });
});
