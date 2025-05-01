const express = require("express")
const { ObjectId } = require("mongodb")
const { db } = require("../config/db")
const stripe = require("../config/stripe")

const router = express.Router()

// Get all donations
router.get("/", async (req, res) => {
  try {
    const campaigns = await db.donation.find({}).toArray()
    res.json({ campaigns })
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaigns" })
  }
})

// Create a new donation campaign
router.post("/", async (req, res) => {
  try {
    const campaign = req.body
    const result = await db.donation.insertOne(campaign)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: "Failed to create campaign" })
  }
})

// Get donation campaign by ID
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const result = await db.donation.findOne(query)

    if (!result) {
      return res.status(404).json({ error: "Campaign not found" })
    }

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaign" })
  }
})

// Update a donation campaign
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const updatedCampaign = req.body
    const result = await db.donation.updateOne({ _id: new ObjectId(id) }, { $set: updatedCampaign })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: "Failed to update campaign" })
  }
})

// Delete a donation campaign
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.donation.deleteOne({ _id: new ObjectId(id) })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: "Failed to delete campaign" })
  }
})

// Create Stripe payment session
router.post("/create-payment-session", async (req, res) => {
  try {
    const { amount, campaignId } = req.body
    const numericAmount = Number.parseFloat(amount)

    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: "Invalid amount provided" })
    }

    // Get campaign details
    const campaign = await db.donation.findOne({ _id: new ObjectId(campaignId) })
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" })
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: campaign.title,
              description: campaign.description,
            },
            unit_amount: Math.round(numericAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://pet-adoption-corner-lq7c.vercel.app/success?session_id={CHECKOUT_SESSION_ID}&campaign_id=${campaignId}&amount=${numericAmount}`,
      cancel_url: `https://pet-adoption-corner-lq7c.vercel.app/cancel`,
    })

    await db.stripeCollection.insertOne({
      sessionId: session.id,
      campaignId: campaignId,
      amount: numericAmount,
      status: "pending",
      createdAt: new Date(),
    })

    res.json({ id: session.id })
  } catch (error) {
    console.error("Payment session error:", error)
    res.status(500).json({ error: "Failed to create payment session" })
  }
})

// Verify payment
router.post("/verify-payment", async (req, res) => {
  const { sessionId, campaignId, amount } = req.body

  try {
    const numericAmount = Number.parseFloat(amount)
    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: "Invalid amount provided" })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session && session.payment_status === "paid" && session.amount_total === numericAmount * 100) {
      // Update the campaign donation status or total in the database
      await db.donation.updateOne({ _id: new ObjectId(campaignId) }, { $inc: { raised: numericAmount } })
      res.json({ success: true, message: "Payment verified and recorded" })
    } else {
      res.status(400).json({ error: "Payment not verified" })
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    res.status(500).json({ error: "Error verifying payment" })
  }
})

// Update donation after successful payment
router.post("/update-donation", async (req, res) => {
  try {
    const { campaignId, amount, sessionId } = req.body
    const numericAmount = Number.parseFloat(amount)

    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: "Invalid amount provided" })
    }

    // Verify session exists and hasn't been processed
    const existingSession = await db.stripeCollection.findOne({
      sessionId: sessionId,
      status: "pending",
    })

    if (!existingSession) {
      return res.status(400).json({ error: "Invalid or already processed session" })
    }

    // Update campaign
    const result = await db.donation.updateOne(
      { _id: new ObjectId(campaignId) },
      {
        $inc: {
          raised: numericAmount,
          donors: 1,
        },
        $set: { lastUpdate: new Date() },
      },
    )

    // Update session status
    await db.stripeCollection.updateOne(
      { sessionId: sessionId },
      { $set: { status: "completed", completedAt: new Date() } },
    )

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Campaign not found or update failed" })
    }

    res.json({ success: true, message: "Donation updated successfully" })
  } catch (error) {
    console.error("Update donation error:", error)
    res.status(500).json({ error: "Failed to update donation" })
  }
})

// Get payment list
router.get("/payment-list", async (req, res) => {
  try {
    const result = await db.stripeCollection.find().toArray()
    res.send(result)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment list" })
  }
})

// Get donation details
router.get("/donation-detail", async (req, res) => {
  try {
    const cursor = db.stipeCollection.find()
    const result = await cursor.toArray()
    res.send(result)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch donation details" })
  }
})

// Post donation details
router.post("/donation-detail", async (req, res) => {
  try {
    const newcart = req.body
    const result = await db.stipeCollection.insertOne(newcart)
    res.send(result)
  } catch (error) {
    res.status(500).json({ error: "Failed to create donation detail" })
  }
})

// Delete donation detail
router.delete("/donation-detail/:id", async (req, res) => {
  try {
    const id = req.params.id
    const filter = { _id: new ObjectId(id) }
    const result = await db.stipeCollection.deleteOne(filter)
    res.send(result)
  } catch (error) {
    res.status(500).json({ error: "Failed to delete donation detail" })
  }
})

module.exports = router
