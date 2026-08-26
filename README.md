# Travel Planner

Travel Planner is a full-stack travel booking application inspired by a tour booking platform. It allows users to browse tour packages, view tour details, create accounts, log in, leave reviews, and book trips through a Stripe checkout flow.

## Features

- Tour catalog with overview and detailed tour pages
- User authentication and authorization
- Protected routes for account management
- Server-side validation and centralized error handling
- Pug templates with Express rendering

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- Pug
- JWT for authentication
- bcryptjs for password hashing
- Multer + Sharp for image handling
- Parcel for front-end asset bundling

## Prerequisites

Before running the project, make sure you have:

- Node.js installed
- MongoDB database available
- An environment file configured for the app

## Installation

1. Install dependencies:

```bash
npm install
```

3. Create or update the environment file in `config/config.env` with the required values:

```env
NODE_ENV=development
PORT=3000
DATABASE=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
STRIPE_SECRET_KEY=your_stripe_secret_key
MAPBOX_TOKEN=your_mapbox_token
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_email
```

## Running the App

Start the development server:

```bash
npm start
```

Build the front-end JavaScript bundle:

```bash
npm run build:js
```

Watch for front-end changes during development:

```bash
npm run watch:js
```

4. github link: https://github.com/DaK-code/Travel-planner.git

5. Render link : https://travel-planner-8rax.onrender.com/

## Test Credentials

### Admin account

Email: user@travelplanner.com
Password:User1234!

Role: user



## Main Routes

### Frontend views

- `GET /` - Home page with all tours
- `GET /tour/:slug` - Tour detail page
- `GET /login` - Login form
- `GET /signup` - Signup form
- `GET /me` - User account page
- `GET /my-tours` - User booked tours

### API routes

- `GET /api/v1/tours` - Get all tours
- `GET /api/v1/tours/:id` - Get a single tour
- `POST /api/v1/tours` - Create a tour
- `PATCH /api/v1/tours/:id` - Update a tour
- `DELETE /api/v1/tours/:id` - Delete a tour
- `POST /api/v1/users/signup` - Register a new user
- `POST /api/v1/users/login` - Log in user
- `GET /api/v1/users/logout` - Log out user
