const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const handlerFactory = require("../utils/handlerFactory");

const multer = require("multer");
const sharp = require("sharp");

// MULTER
const multerStorage = multer.memoryStorage();

// ALIAS TOP TOURS
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
};

// 1. GET ALL TOURS

exports.getAllTours = catchAsync(async (req, res) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

// 2. GET ONE TOUR

exports.getTour = handlerFactory.getOne(Tour, "reviews");

// 3. CREATE TOUR

exports.createTour = handlerFactory.createOne(Tour);

// 4. UPDATE TOUR
// La factory est utilisée ici après le traitement des images.
exports.updateTour = handlerFactory.updateOne(Tour);

// 5. DELETE TOUR

exports.deleteTour = handlerFactory.deleteOne(Tour);

// 6. GEOSPATIAL SEARCH
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(",");

  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400,
      ),
    );
  }

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

// MULTER FILTER
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

// MULTER UPLOAD
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// UPLOAD TOUR IMAGES
exports.uploadTourImages = upload.fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 3,
  },
]);

// RESIZE TOUR IMAGES
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // Si aucune image n'est envoyée,
  // on continue normalement.
  if (!req.files) {
    return next();
  }

  // IMAGE COVER
  if (req.files.imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({
        quality: 90,
      })
      .toFile(`public/img/tours/${req.body.imageCover}`);
  }

  // ADDITIONAL IMAGES
  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({
            quality: 90,
          })
          .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
      }),
    );
  }

  next();
});
