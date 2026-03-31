# AuraRun - MERN E-Commerce Platform

A full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js) featuring customer storefront, authentication flows, and an admin dashboard.

## Features

- Modern storefront with product listing, filtering, and product detail pages
- Cart, wishlist, checkout, payment flow, and order tracking
- Role-based access (`user`, `editor`, `admin`)
- Admin panel with product, category, order, coupon, announcement, user, and contact management
- Media gallery management for products with drag-and-drop image sequencing
- Email-based auth utilities: 6-digit OTP signup verification, forgot-password reset via email link, and profile email verification
- Cloudinary image upload integration

## Tech Stack

- Frontend: React, Vite, Redux Toolkit, React Router, Axios
- Backend: Node.js, Express, Mongoose, JWT, Nodemailer
- Database: MongoDB
- Media: Cloudinary

## Project Structure

```text
ecommerce-mern/
  client/   # React frontend
  server/   # Express API + MongoDB models/controllers/routes
```

## Local Setup

### 1) Clone and install dependencies

```bash
git clone https://github.com/abhhishhek/AuraRun.git
cd AuraRun
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2) Create environment file

Create `server/.env` with:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

APP_NAME=AuraRun
SUPPORT_EMAIL=support@example.com
MAIL_FROM=AuraRun <no-reply@example.com>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
```

### 3) Run the app

From project root:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Available Scripts

At root:

- `npm run dev` - runs both client and server concurrently
- `npm run client` - runs React app
- `npm run server` - runs backend API

Inside `client`:

- `npm run dev`
- `npm run build`
- `npm run preview`

Inside `server`:

- `npm run dev`
- `npm start`

## API Base

- Base URL: `http://localhost:5000/api`
- Main route groups: `/auth`, `/products`, `/orders`, `/cart`, `/wishlist`, `/reviews`, `/coupons`, `/categories`, `/settings`, `/announcements`, `/users`, `/contacts`

## Security Notes

- Do not commit `.env` files
- Rotate secrets immediately if exposed
- Use app passwords for SMTP providers like Gmail

## License

This project is for learning and portfolio use. Add your preferred license before production release.
