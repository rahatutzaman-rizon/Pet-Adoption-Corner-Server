const express = require("express")
const { ObjectId } = require("mongodb")
const { db } = require("../config/db")

const router = express.Router()

// Get all pets
router.get("/", async (req, res) => {
  try {
    const pets = await db.petCollection.find({}).toArray()
    res.status(200).send(pets)
  } catch (error) {
    res.status(500).send({ message: "Error fetching pets", error: error.message })
  }
})

// Get pet by ID
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const result = await db.petCollection.findOne(query)

    if (!result) {
      return res.status(404).send({ message: "Pet not found" })
    }

    res.send(result)
  } catch (error) {
    res.status(500).send({ message: "Error fetching pet", error: error.message })
  }
})

// Add a new pet
router.post("/", async (req, res) => {
  try {
    const newPet = req.body
    const result = await db.petCollection.insertOne(newPet)
    res.status(201).send(result)
  } catch (error) {
    res.status(500).send({ message: "Error adding new pet", error: error.message })
  }
})

// Update a pet
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const updatedPet = req.body

    const result = await db.petCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedPet })

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "Pet updated successfully" })
    } else {
      res.status(404).json({ message: "Pet not found" })
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update pet", error: error.message })
  }
})

// Delete a pet
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id
    const filter = { _id: new ObjectId(id) }
    const result = await db.petCollection.deleteOne(filter)

    if (result.deletedCount === 1) {
      res.status(200).send({ message: "Pet deleted successfully" })
    } else {
      res.status(404).send({ message: "Pet not found" })
    }
  } catch (error) {
    res.status(500).send({ message: "Failed to delete pet", error: error.message })
  }
})

// Get pets by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params
    const query = { category }
    const result = await db.petCollection.find(query).toArray()
    res.send(result)
  } catch (error) {
    res.status(500).send({ message: "Error fetching pets by category", error: error.message })
  }
})

// Add pet for adoption
router.post("/adopt", async (req, res) => {
  try {
    const newPet = req.body
    const result = await db.adoptCollection.insertOne(newPet)
    res.status(201).send(result)
  } catch (error) {
    res.status(500).send({ message: "Error adding pet for adoption", error: error.message })
  }
})

// Get all pets for adoption
router.get("/adopt", async (req, res) => {
  try {
    const result = await db.adoptCollection.find().toArray()
    res.send(result)
  } catch (error) {
    res.status(500).send({ message: "Error fetching adoption pets", error: error.message })
  }
})

// Update pet details
router.patch("/update-pet/:id", async (req, res) => {
  try {
    const id = req.params.id
    const updateData = req.body
    const filter = { _id: new ObjectId(id) }

    const updateDoc = {
      $set: updateData,
    }

    const options = { upsert: true }
    const result = await db.addCollection.updateOne(filter, updateDoc, options)
    res.send(result)
  } catch (error) {
    res.status(500).send({ message: "Error updating pet", error: error.message })
  }
})

module.exports = router
