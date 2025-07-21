# Modern E-Commerce

A modern fullstack e-commerce marketplace with real product variants, admin dashboard, analytics, and more. Built with Next.js, Express, MongoDB, and TypeScript.

---

## Project Description

This application is a full-featured e-commerce platform supporting:
- Customer and admin roles
- Product catalog with images and variants (e.g., color & size)
- Category browsing and filtering
- Cart, checkout, and order management
- Admin dashboard for product, category, order, and customer management
- Secure authentication, rate limiting, and input validation
- Recommendation system and customer activity tracking
- Email notifications for orders
- Analytics dashboard for admins
- Live deployment for demo and production

---

## Technology Stack

**Frontend:**
- Next.js (React 19)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Hook Form, Zod (form validation)
- Recharts (charts)
- Axios

**Backend:**
- Node.js (v18+ recommended)
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT authentication, bcrypt
- Multer (file uploads), Cloudinary (image hosting)
- Nodemailer (email)
- Express-rate-limit, CORS, dotenv

---

## Installation Instructions

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9+ or **yarn**
- **MongoDB** (local or Atlas)
- (Optional) Cloudinary account for image uploads

### 1. Clone the repository
```bash
git clone https://github.com/bahadirsensoz/modern-ecommerce.git
cd modern-ecommerce
```

### 2. Install dependencies
```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3. Environment Variables
Create `.env` files in both `backend/` and `frontend/` directories.

#### Example: `backend/.env`
```
MONGODB_URI=mongodb://localhost:27017/modern-ecommerce
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

#### Example: `frontend/.env`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Running the Application

### 1. Start MongoDB
Make sure your MongoDB server is running.

### 3. Start the Backend
```bash
npm run dev
# or for production
npm run build
npm start
```

### 4. Start the Frontend
```bash
cd ../frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials

**Admin:**
- Email: `admin@example.com`
- Password: `12345678`

**Customer:**
- Email: `customer@example.com`
- Password: `12345678`

*(You can create these users via registration or seed script if needed.)*

---

## API Documentation

### Main Endpoints

#### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout

#### Products
- `GET /api/products` — List all active products
- `GET /api/products/:id` — Get product details
- `POST /api/products` — Create product (admin)
- `PUT /api/products/:id` — Update product (admin)
- `DELETE /api/products/:id` — Delete product (admin)

#### Categories
- `GET /api/categories` — List categories
- `POST /api/categories` — Create category (admin)

#### Cart
- `GET /api/cart` — Get current cart
- `POST /api/cart/add` — Add to cart
- `PUT /api/cart/update` — Update cart item
- `POST /api/cart/remove` — Remove from cart
- `POST /api/cart/clear` — Clear cart

#### Orders
- `GET /api/orders/me` — List user orders
- `POST /api/orders` — Place order
- `GET /api/orders/:id` — Get order details
- `PUT /api/orders/:id/status` — Update order status (admin)

#### Example: Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sample Product",
  "price": 100,
  "category": "<category_id>",
  "variants": [
    { "color": "Red", "size": "M" },
    { "color": "Blue", "size": "L" }
  ]
}
```

---

## Deployment Guide

- Set environment variables for production (see above).
- Build frontend and backend:
  ```bash
  cd backend && npm run build
  cd ../frontend && npm run build
  ```
- Use a process manager (e.g., PM2) or Docker for backend.
- Serve frontend with Vercel, Netlify, or Node.js.
- Use HTTPS and secure CORS settings in production.
- [Live Demo](https://modern-ecommerce-murex.vercel.app) *(replace with your actual link)*

---

## Features List

- User registration, login, JWT authentication
- Product catalog with images and variants (color, size, etc.)
- Category browsing and filtering
- Cart and checkout flow
- Order management (customer and admin)
- Admin dashboard: manage products, categories, orders, customers
- Product recommendations (based on user activity and category)
- Rate limiting, input validation, XSS protection
- Secure file upload (Multer + Cloudinary)
- Email notifications (Nodemailer)
- Database seeding with data
- Newsletter subscription and management
- Analytics dashboard for admins

---

## Bonus Features

- **Live deployment:** [Demo Link](https://modern-ecommerce-murex.vercel.app)
- **Email notifications for orders** (order confirmation, status updates)
- **Basic analytics dashboard** (sales, orders, customers, product stats)

---

## Example Environment Files

See above or create `.env` files in both `backend/` and `frontend/` as shown.

---

## Database Seeding

To seed the database with demo products and variants:

```bash
cd backend
npm run build
node dist/scripts/seedProducts.js
```

---

For questions or contributions, open an issue or pull request!
