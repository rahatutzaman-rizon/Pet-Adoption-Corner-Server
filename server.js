const express = require("express")
const cors = require("cors")
const { connectDB } = require("./config/db")
require("dotenv").config()

// Import routes
const petRoutes = require("./routes/petRoutes")
const donationRoutes = require("./routes/donationRoutes")
const userRoutes = require("./routes/userRoutes")
const shopRoutes = require("./routes/shopRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const orderRoutes = require("./routes/orderRoutes")

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
connectDB()

// Routes
app.use("/pet-listing", petRoutes)
app.use("/add-pet", petRoutes)
app.use("/adopt", petRoutes)
app.use("/donation", donationRoutes)
app.use("/donation-campaign", donationRoutes)
app.use("/donation-detail", donationRoutes)
app.use("/users", userRoutes)
app.use("/shop", shopRoutes)
app.use("/order", orderRoutes)
app.use("/payment", paymentRoutes)

// Root route
app.get("/", (req, res) => {
  res.send("Pet Adoption Server is running")
})

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
