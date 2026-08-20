class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1. FILTERING
  filter() {
    const queryObj = { ...this.queryString };

    const excludedFields = ["page", "sort", "limit", "fields"];

    excludedFields.forEach((el) => delete queryObj[el]);

    const filterObj = {};

    Object.keys(queryObj).forEach((key) => {
      const value = queryObj[key];

      // Advanced filtering:
      // ?price[gte]=500
      const advancedFilterMatch = key.match(
        /^([a-zA-Z0-9_]+)\[(gte|gt|lte|lt)\]$/,
      );

      if (advancedFilterMatch) {
        const field = advancedFilterMatch[1];
        const operator = advancedFilterMatch[2];

        if (!filterObj[field]) {
          filterObj[field] = {};
        }

        filterObj[field][`$${operator}`] = value;

        return;
      }

      // Normal filtering:
      // ?difficulty=easy
      filterObj[key] = value;
    });

    this.query = this.query.find(filterObj);

    return this;
  }

  // 2. SORTING
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  // 3. FIELD LIMITING
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");

      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  // 4. PAGINATION
  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
