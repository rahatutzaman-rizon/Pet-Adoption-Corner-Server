const express = require('express');
const cors = require('cors');
const app = express();




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
    // Connect the client to the server	(optional starting in v4.7)
     //await client.connect();

    ///create a collection of documents
    const petCollection = client.db('petcollection').collection('adopted');
    const donateCollection = client.db('petcollection').collection('campaign');
    const adoptCollection=client.db('petcollection').collection('adopt');
    const addCollection=client.db('petcollection').collection("add-pet");
    const stipeCollection=client.db('petcollection').collection("stipe");
    const usersCollection=client.db("petcollection").collection("users");

////insert a book post 
//  app.post('/upload-book',async(req,res)=>{

//   const data=req.body;

//   //
//   const result=await booksCollection.insertOne(data);
//   console.log(result)
//   res.send(result);
//  })


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

 //find to get

 app.get('/pet-listing',async(req,res)=>{

  const pet=petCollection.find();

  const result=await pet.toArray();

  res.send(result);
 })


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
    await client.db("admin").command({ ping: 1 });
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
