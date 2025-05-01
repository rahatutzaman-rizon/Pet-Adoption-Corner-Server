const express = require("express")
const { db } = require("../config/db")

const router = express.Router()

// Create a new order
router.post("/", async (req, res) => {
  try {
    const orderData = req.body
    console.log("Received order data:", orderData)

    // Check if data is empty
    if (!orderData || Object.keys(orderData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order data provided",
      })
    }

    // Remove any existing _id field from the order data
    const { _id, ...orderDataWithoutId } = orderData

    // Create a new order document
    const newOrder = {
      ...orderDataWithoutId,
      createdAt: new Date(),
      status: "pending",
    }

    // Check database connection
    if (!db.orderCollection) {
      throw new Error("Database collection not initialized")
    }

    const result = await db.orderCollection.insertOne(newOrder)
    console.log("Insert result:", result)

    if (result.acknowledged) {
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        orderId: result.insertedId,
        data: newOrder,
      })
    } else {
      throw new Error("Order creation failed")
    }
  } catch (error) {
    console.error("Order creation error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    })
  }
})

// Get all orders
router.get("/", async (req, res) => {
  try {
    const cursor = db.orderCollection.find()
    const result = await cursor.toArray()
    res.send(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    })
  }
})

module.exports = router
