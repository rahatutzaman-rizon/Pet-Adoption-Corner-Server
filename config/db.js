const { MongoClient, ServerApiVersion } = require("mongodb")
require("dotenv").config()

const uri =
  process.env.MONGODB_URI ||
  "mongodb://redwantamim525:O1kuwCQ24KxdUUiT@ac-cpspwpq-shard-00-00.ldanhxi.mongodb.net:27017,ac-cpspwpq-shard-00-01.ldanhxi.mongodb.net:27017,ac-cpspwpq-shard-00-02.ldanhxi.mongodb.net:27017/?ssl=true&replicaSet=atlas-ndw10b-shard-0&authSource=admin&retryWrites=true&w=majority"

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

// Database collections
const db = {
  petCollection: null,
  donateCollection: null,
  adoptCollection: null,
  addCollection: null,
  stripeCollection: null,
  usersCollection: null,
  shop: null,
  orderCollection: null,
  donation: null,
}

async function connectDB() {
  try {
    // Connect to MongoDB
    await client.connect()
    console.log("Connected to MongoDB")

    // Initialize collections
    db.petCollection = client.db("petcollection").collection("adopted")
    db.donateCollection = client.db("petcollection").collection("campaign")
    db.adoptCollection = client.db("petcollection").collection("adopt")
    db.addCollection = client.db("petcollection").collection("add-pet")
    db.stripeCollection = client.db("petcollection").collection("stripe")
    db.usersCollection = client.db("petcollection").collection("users")
    db.shop = client.db("petcollection").collection("food")
    db.orderCollection = client.db("petcollection").collection("order")
    db.donation = client.db("petcollection").collection("donation")

    console.log("Database collections initialized")
  } catch (error) {
    console.error("Database connection error:", error)
    process.exit(1)
  }
}

module.exports = { connectDB, client, db }
