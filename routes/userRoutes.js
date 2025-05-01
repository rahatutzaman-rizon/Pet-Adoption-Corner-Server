const express = require("express")
const { ObjectId } = require("mongodb")
const { db } = require("../config/db")

const router = express.Router()

// Get all users
router.get("/", async (req, res) => {
  try {
    const result = await db.usersCollection.find().toArray()
    res.send(result)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Create a new user
router.post("/", async (req, res) => {
  try {
    const user = req.body
    const result = await db.usersCollection.insertOne(user)
    res.send(result)
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" })
  }
})

// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id
    const filter = { _id: new ObjectId(id) }
    const result = await db.usersCollection.deleteOne(filter)
    res.send(result)
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" })
  }
})

module.exports = router
