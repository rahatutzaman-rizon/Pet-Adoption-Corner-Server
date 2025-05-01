const express = require("express")
const { ObjectId } = require("mongodb")
const { db } = require("../config/db")
const stripe = require("../config/stripe")

const router = express.Router()

// Get payment list
router.get("/list", async (req, res) => {
  try {
    const result = await db.stripeCollection.find().toArray()
    res.send(result)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment list" })
  }
})

// Create payment session
router.post("/create-session", async (req, res) => {
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

module.exports = router
