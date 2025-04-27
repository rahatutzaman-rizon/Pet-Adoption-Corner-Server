const express = require('express');
const cors = require('cors');
const app = express();

const stripe = require('stripe')('sk_test_51Klod6Hm471kJsphHC9404YI2Hc35Lm1glEThlrgK2dlNyEfCxt0njVK9bhskSvJmGo8DLyVoTNBYjqWyeSTy0iu00BKTjH4nG')





//mongodb
 const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
 require('dotenv').config()
 const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



//
const uri ="mongodb://redwantamim525:O1kuwCQ24KxdUUiT@ac-cpspwpq-shard-00-00.ldanhxi.mongodb.net:27017,ac-cpspwpq-shard-00-01.ldanhxi.mongodb.net:27017,ac-cpspwpq-shard-00-02.ldanhxi.mongodb.net:27017/?ssl=true&replicaSet=atlas-ndw10b-shard-0&authSource=admin&retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
 
    ///create a collection of documents
    const petCollection = client.db('petcollection').collection('adopted');
    const donateCollection = client.db('petcollection').collection('campaign');
    const adoptCollection=client.db('petcollection').collection('adopt');
    const addCollection=client.db('petcollection').collection("add-pet");
    const stipeCollection=client.db('petcollection').collection("stipe");
    const usersCollection=client.db("petcollection").collection("users");
    const shop=client.db("petcollection").collection("food");
    const orderCollection=client.db("petcollection").collection("order");
    const donation =client.db("petcollection").collection("donation");
    const stripeCollection =client.db("petcollection").collection("stripe");


app.get('/donation', async (req, res) => {
  try {
    const campaigns = await donation.find({}).toArray();
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Create a new campaign
app.post('/donation', async (req, res) => {
  try {
    const campaign = req.body;
    const result = await donation.insertOne(campaign);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Update a campaign by ID
app.put('/donation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCampaign = req.body;
    const result = await donation.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedCampaign }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Delete a campaign by ID
app.delete('/donation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await donation.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});




// Get single campaign by ID
app.get("/donation/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await donation.findOne(query);
    if (!result) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Create Stripe payment session
app.post('/create-payment-session', async (req, res) => {
  try {
    const { amount, campaignId } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Invalid amount provided' });
    }

    // Get campaign details
    const campaign = await donation.findOne({ _id: new ObjectId(campaignId) });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: campaign.title,
              description: campaign.description,
            },
            unit_amount: Math.round(numericAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://pet-adoption-corner-lq7c.vercel.app/success?session_id={CHECKOUT_SESSION_ID}&campaign_id=${campaignId}&amount=${numericAmount}`,
      cancel_url: `https://pet-adoption-corner-lq7c.vercel.app/cancel`,
    });

    // Save session details to stripeCollection for tracking
    await stripeCollection.insertOne({
      sessionId: session.id,
      campaignId: campaignId,
      amount: numericAmount, // Store as number
      status: 'pending',
      createdAt: new Date(),
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Payment session error:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

// Verify payment
app.post('/verify-payment', async (req, res) => {
  const { sessionId, campaignId, amount } = req.body;
  
  try {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Invalid amount provided' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session && session.payment_status === 'paid' && session.amount_total === numericAmount * 100) {
      // Update the campaign donation status or total in the database
      await donation.updateOne(
        { _id: new ObjectId(campaignId) },
        { $inc: { raised: numericAmount } } // Use numeric amount
      );
      res.json({ success: true, message: 'Payment verified and recorded' });
    } else {
      res.status(400).json({ error: 'Payment not verified' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Error verifying payment' });
  }
});

// Update donation after successful payment
app.post('/update-donation', async (req, res) => {
  try {
    const { campaignId, amount, sessionId } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Invalid amount provided' });
    }

    // Verify session exists and hasn't been processed
    const existingSession = await stripeCollection.findOne({ 
      sessionId: sessionId,
      status: 'pending'
    });

    if (!existingSession) {
      return res.status(400).json({ error: 'Invalid or already processed session' });
    }

    // Update campaign
    const result = await donation.updateOne(
      { _id: new ObjectId(campaignId) },
      {
        $inc: { 
          raised: numericAmount, // Ensure `raised` field is numeric in the schema
          donors: 1 
        },
        $set: { lastUpdate: new Date() }
      }
    );

    // Update session status
    await stripeCollection.updateOne(
      { sessionId: sessionId },
      { $set: { status: 'completed', completedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Campaign not found or update failed' });
    }

    res.json({ success: true, message: 'Donation updated successfully' });
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({ error: 'Failed to update donation' });
  }
});



//get payment

app.get('/paymentList',async(req,res)=>{

  const result=await stripeCollection.find().toArray();
  res.send(result);
})





//signup role of users
app.post('/users', async(req,res)=>{
  const users= req.body;
  console.log(users)

 const result = await usersCollection.insertOne(users);

 res.send(result);
})


app.get('/users',async(req,res)=>{

  const result=await usersCollection.find().toArray();
  res.send(result);
})




//insert donation campign field 
app.post('/donation-campaign', async(req,res)=>{
  const newcart = req.body;

 const result = await donateCollection.insertOne(newcart);

 res.send(result);
})

app.get("/donation-campaign", async (req, res) => {
const cursor = donateCollection.find();
const result = await cursor.toArray();
res.send(result);
}); 




 ////insert a pet post 
 app.post('/adopt', async(req,res)=>{
  const newcart = req.body;
 console.log(newcart)
 const result = await adoptCollection.insertOne(newcart);
 console.log(result)
 res.send(result);
})

app.get("/adopt", async (req, res) => {
const cursor = adoptCollection.find();
const result = await cursor.toArray();
res.send(result);
}); 

//add pet 
app.post('/add-pet',async(req,res)=>{

    const data=req.body;
  
    //
    const result=await addCollection.insertOne(data);
    
    res.send(result);
})


///shop
// GET all products
app.get('/shop', async (req, res) => {
  try {
    const products = await shop.find().toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new product
app.post('/shop', async (req, res) => {
  try {
    const { name, forAnimal, image, quantity, description } = req.body;
    const result = await shop.insertOne({ name, forAnimal, image, quantity, description });

    if (result.insertedId) {
      res.status(201).json({ _id: result.insertedId, name, forAnimal, image, quantity, description });
    } else {
      res.status(400).json({ message: 'Failed to create product' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// PUT update a product
app.put('/shop/:id', async (req, res) => {
  const { id } = req.params;
  const { name, forAnimal, image, quantity, description } = req.body;

  try {
    const updatedProduct = await shop.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name, forAnimal, image, quantity, description } },
      { returnOriginal: false }
    );

    if (!updatedProduct.value) return res.status(404).json({ message: 'Product not found' });
    res.json(updatedProduct.value);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a product
app.delete('/shop/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await shop.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});








  app.post('/order', async(req, res) => {
    try {
        const orderData = req.body;
        console.log('Received order data:', orderData);

        // Check if data is empty
        if (!orderData || Object.keys(orderData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order data provided'
            });
        }

        // Remove any existing _id field from the order data
        const { _id, ...orderDataWithoutId } = orderData;

        // Create a new order document
        const newOrder = {
            ...orderDataWithoutId,
            createdAt: new Date(),
            status: 'pending'
        };

        // Check database connection
        if (!orderCollection) {
            throw new Error('Database collection not initialized');
        }

        const result = await orderCollection.insertOne(newOrder);
        console.log('Insert result:', result);

        if (result.acknowledged) {
            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                orderId: result.insertedId,
                data: newOrder
            });
        } else {
            throw new Error('Order creation failed');
        }

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
});

  

app.get("/order", async (req, res) => {
  const cursor = orderCollection.find();
  const result = await cursor.toArray();
  res.send(result);
  }); 






app.get("/add-pet", async (req, res) => {
  const cursor = addCollection.find();
  const result = await cursor.toArray();
  res.send(result);
  }); 

 

    app.get("/add-pet/:id", async (req, res) => {
      const id=req.params.id;
     const query={
      _id : new ObjectId(id)
     }
      const result = await addCollection.findOne(query) ;
      res.send(result);
    });


 ///MOREdetail a book

 app.get("/moredetail/:id", async (req, res) => {
  const id=req.params.id;
 const query={
  _id : new ObjectId(id)
 }
  const result = await petCollection.findOne(query) ;
  res.send(result);
});

//part2 stripe
app.get("/moredetail2/:id", async (req, res) => {
  const id=req.params.id;
 const query={
  _id : new ObjectId(id)
 }
  const result = await petCollection.findOne(query) ;
  res.send(result);
});

//post it donation detail

app.post('/donation-detail', async(req,res)=>{
  const newcart = req.body;
 console.log(newcart)
 const result = await stipeCollection.insertOne(newcart);
 console.log(result)
 res.send(result);
})

app.get("/donation-detail", async (req, res) => {
const cursor = stipeCollection.find();
const result = await cursor.toArray();
res.send(result);
}); 


// Get all pets
app.get('/pet-listing', async (req, res) => {
  try {
    const pets = await petCollection.find({}).toArray();
    res.status(200).send(pets);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching pets', error });
  }
});

// Add a new pet
app.post('/pet-listing', async (req, res) => {
  try {
    const newPet = req.body;
    const result = await petCollection.insertOne(newPet);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: 'Error adding new pet', error });
  }
});

// edit  a pet
app.put('/pet-listing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPet = req.body;

    const result = await petCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedPet }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'Pet updated successfully' });
    } else {
      res.status(404).json({ message: 'Pet not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update pet', error: error.message });
  }
});








// Delete a pet
app.delete('/pet-listing/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await petCollection.deleteOne(filter);
    if (result.deletedCount === 1) {
      res.status(200).send({ message: 'Pet deleted successfully' });
    } else {
      res.status(404).send({ message: 'Pet not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Failed to delete pet', error });
  }
});




////query
app.get('/pet-category',async(req,res)=>{

 let query={};
 if(req.query?.category){
  query={category: req.query.category}
 }
 const result= await booksCollection.find(query).toArray();


  res.send(result);
 })


 ///update add-pet 
 app.patch("/update-pet/:id", async(req,res)=>{

  const id=req.params.id;
const updateBooksData=req.body;
const filter ={ _id :new ObjectId(id)};


const updateDoc = {
  $set: updateBooksData
};
const options = { upsert: true };

const result=await addCollection.updateOne(filter,updateDoc,options);

  res.send(result)
 })


 ///refund a donation

 app.delete("/donation-detail/:id", async(req,res)=>{

  const id=req.params.id;

const filter ={ _id :new ObjectId(id)};
const result= await stipeCollection.deleteOne(filter)
res.send(result);


})

//pet delete
app.delete("/pet-listing/:id", async(req,res)=>{

  const id=req.params.id;

const filter ={ _id :new ObjectId(id)};
const result= await petCollection.deleteOne(filter)
res.send(result);


})

///adopt remove

app.delete("/pet-listing/:id", async(req,res)=>{

  const id=req.params.id;

const filter ={ _id :new ObjectId(id)};
const result= await petCollection.deleteOne(filter)
res.send(result);


})


//delete adopted pet
app.delete("/add-pet/:id", async(req,res)=>{

  const id=req.params.id;

const filter ={ _id :new ObjectId(id)};
const result= await addCollection.deleteOne(filter)
res.send(result);


})


///adope /remove request


app.delete("/adoption/:id", async(req,res)=>{

  const id=req.params.id;

const filter ={ _id :new ObjectId(id)};
const result= await petCollection.deleteOne(filter)
res.send(result);


})
    
    




//delete a users

app.delete("/users/:id", async(req,res)=>{

  const id=req.params.id;

const filter ={ _id :new ObjectId(id)};
const result= await usersCollection.deleteOne(filter)
res.send(result);


})

    // Send a ping to confirm a successful connection
    //sawait client.db("admin").command({ ping: 1 });
    //console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',async(req,res)=>{
    res.send('server is running')
})

app.listen(port,()=>{
    console.log(port);
})
