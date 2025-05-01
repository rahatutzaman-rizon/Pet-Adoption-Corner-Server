const express = require("express")
const { ObjectId } = require("mongodb")
const { db } = require("../config/db")

const router = express.Router()

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await db.shop.find().toArray()
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST a new product
router.post("/", async (req, res) => {
  try {
    const { name, forAnimal, image, quantity, description } = req.body
    const result = await db.shop.insertOne({ name, forAnimal, image, quantity, description })

    if (result.insertedId) {
      res.status(201).json({ _id: result.insertedId, name, forAnimal, image, quantity, description })
    } else {
      res.status(400).json({ message: "Failed to create product" })
    }
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// PUT update a product
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { name, forAnimal, image, quantity, description } = req.body

  try {
    const updatedProduct = await db.shop.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name, forAnimal, image, quantity, description } },
      { returnOriginal: false },
    )

    if (!updatedProduct.value) return res.status(404).json({ message: "Product not found" })
    res.json(updatedProduct.value)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// DELETE a product
router.delete("/:id", async (req, res) => {
  const { id } = req.params
  try {
    const result = await db.shop.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return res.status(404).json({ message: "Product not found" })
    res.json({ message: "Product deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
