const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express()
const port=process.env.PORT || 5000;

//sakib
//hR7wU3LMZ80Uq68U
console.log(process.env.DB_USER)

//middleware

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.olvofey.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();
    const foodCollection = client.db("restaurantDB").collection("food");


    app.post('/food', async(req,res)=>{
      const addFood=req.body;
      console.log(addFood)
      const result = await foodCollection.insertOne(addFood);
      res.send(result)
    })
    app.get('/food', async(req,res)=>{
      const cursor = foodCollection.find();
      const result= await cursor.toArray();
      res.send(result)
    })
    app.get('/food/:id', async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)}
      const result = await foodCollection.findOne(query);
      res.send(result)
    })
    app.put('/food/:id', async(req,res)=>{
      const id=req.params.id;
      const filter={_id: new ObjectId(id)}
      const options = { upsert: true };
      const updateFood=req.body;
      const food = {
        $set: {
          food_name:updateFood.food_name,image:updateFood.image ,category:updateFood.category,quantity:updateFood.quantity,price:updateFood.price,addby:updateFood.addby,food_origin:updateFood.food_origin,description:updateFood.description
        },
      };
      const result= await foodCollection.updateOne(filter,food,options)
      res.send(result)
    })
    app.delete('/food/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)}
      const result = await foodCollection.deleteOne(query);
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/',(req,res)=>{
    res.send('Restaurant management is running')
})

app.listen(port,()=>{
    console.log(`Restaurant management is running on port:  ${port}`)
})