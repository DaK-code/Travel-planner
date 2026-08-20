const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty!"],
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "A review must have a rating."],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  },
);

// PREVENT DUPLICATE REVIEWS

reviewSchema.index(
  {
    tour: 1,
    user: 1,
  },
  {
    unique: true,
  },
);

// POPULATE USER

reviewSchema.pre(/^find/, function () {
  this.populate({
    path: "user",
    select: "name photo",
  });
});

// CALCULATE AVERAGE RATINGS

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },

    {
      $group: {
        _id: "$tour",
        nRating: {
          $sum: 1,
        },
        avgRating: {
          $avg: "$rating",
        },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// AFTER CREATE REVIEW

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.tour);
});

// BEFORE UPDATE / DELETE

reviewSchema.pre(/^findOneAnd/, async function () {
  this.r = await this.clone().findOne();
});

// AFTER UPDATE / DELETE

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcAverageRatings(this.r.tour);
  }
});

// MODEL

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
