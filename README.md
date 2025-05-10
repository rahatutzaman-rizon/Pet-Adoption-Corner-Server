# 🐾 Pet Adoption System - Backend

This is the backend server for the **Pet Adoption System**, built with Node.js and Express. It supports core features like pet listing and adoption, donation campaigns, user authentication, shop purchases, order processing, and payment integration.

---

## 🚀 Features

- 🐶 Pet Listing, Adding, and Adoption
- ❤️ Donation Campaigns & Details
- 👤 User Management
- 🛒 Pet Food Shop & Orders
- 💳 Payment Integration (e.g., Stripe)
- 🔒 RESTful APIs with secure endpoints
- 🌐 Cross-Origin Resource Sharing (CORS)
- 📦 MongoDB Database Integration

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **Stripe (or any payment API)**
- **dotenv for environment configs**
- **CORS for frontend-backend communication**

---

## 📁 Project Structure

.
├── config/
│ └── db.js # MongoDB connection
├── routes/
│ ├── petRoutes.js
│ ├── donationRoutes.js
│ ├── userRoutes.js
│ ├── shopRoutes.js
│ ├── orderRoutes.js
│ └── paymentRoutes.js
├── controllers/ # (If used) Business logic
├── models/ # Mongoose schemas
├── .env # Environment variables
├── package.json
└── server.js # Main server entry

yaml
Copy
Edit

---

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pet-adoption-backend.git
   cd pet-adoption-backend
Install dependencies

bash
Copy
Edit
npm install
Configure Environment Variables

Create a .env file in the root directory and add:

ini
Copy
Edit
PORT=5000
MONGO_URI=your_mongo_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
Start the server

bash
Copy
Edit
npm start
📡 API Endpoints
Route Prefix	Description
/pet-listing	Get or manage pet listings
/add-pet	Add new pet for adoption
/adopt	Adopt a listed pet
/donation	Make a donation
/donation-campaign	View active donation campaigns
/donation-detail	Get campaign details
/users	User registration/login
/shop	View products in pet food shop
/order	Place an order
/payment	Handle Stripe payment