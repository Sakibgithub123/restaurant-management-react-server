const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParse=require('cookie-parser')
require('dotenv').config();
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


console.log(process.env.DB_USER)

//middleware

app.use(cors({
  origin:[
    'http://localhost:5173','https://enmmedia-19300.web.app',
    'https://restautant-management-react.web.app','https://restautant-management-react.firebaseapp.com'
  ],
  // "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  credentials:true,
}));
app.use(express.json())
app.use(cookieParse())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.olvofey.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middlewares

const logger=(req,res,next)=>{
  console.log('loginfo:',req.method,req.url)
  next();
}
const veryFyToken=(req,res,next)=>{
  const token=req.cookies?.token;
  console.log('token in the middleware',token)
  if(!token){
   return res.status(401).send({message:"unauthorized access"})
  }
  jwt.verify(token.process.env.SECRET_ACCESS_TOKEN,(err,decode)=>{
 if(err){
  return res.status(401).send({message:"unauthorized access"})
 }
 req.user=decode;
 next()

  })
}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const foodCollection = client.db("restaurantDB").collection("food");
    const myfoodCollection = client.db("restaurantDB").collection("myFood");
    const myOrderCollection = client.db("restaurantDB").collection("myOrderFood");
  
    app.post('/jwt',logger, async(req,res)=>{
      const user =req.body;
      console.log('user:',user);
      const token=jwt.sign(user,process.env.SECRET_ACCESS_TOKEN,{expiresIn:'1h'})
      res.cookie('token',token,{
        httpOnly:true,
        secure:true,
        sameSite:"none"
      })
      res.send({success:true})
    })
    app.post('/logout',async(req,res)=>{
      const user=req.body;
      console.log('logout user',user)
      res.clearCookie('token',{maxAge:0}).send({success:true})
    })

    app.post('/food', async (req, res) => {
      const addFood = req.body;
      console.log(addFood)
      const result = await foodCollection.insertOne(addFood);
      res.send(result)
    })
    app.post('/myfood', async (req, res) => {
      const addFood = req.body;
      console.log(addFood)
      const result = await foodCollection.insertOne(addFood);
      res.send(result)
    })
    //myorder
    app.post('/myorderfood', async (req, res) => {
      const addFood = req.body;
      console.log(addFood)
      const result = await myOrderCollection.insertOne(addFood);
      res.send(result)
    })
    app.get('/myorderfood/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const cursor = myOrderCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })
    // app.get('/myorderfood',logger, async (req, res) => {
    //   console.log(req.query.email);
    //   // console.log('ttttt token', req.cookies.token)
    //   console.log('user in the valid token', req.user)
    //   if(req.query.email !== req.user.email){
    //       return res.status(403).send({message: 'forbidden access'})
    //   }

    //   let query = {};
    //   if (req.query?.email) {
    //       query = { email: req.query.email }
    //   }
    //   const result = await myOrderCollection.find(query).toArray();
    //   res.send(result);
    // })
    app.delete('/myorderfood/:id',logger, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await myOrderCollection.deleteOne(query);
      res.send(result)
    })


    //myorderend

    app.get('/food', async (req, res) => {
      const page=parseInt(req.query.page)
      const size=parseInt(req.query.size)
      const cursor = foodCollection.find().skip(page * size).limit(size);
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/food/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await foodCollection.findOne(query);
      console.log(result)
      res.send(result)
    })

    app.put('/food/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateFood = req.body;
      const food = {
        $set: {
          food_name: updateFood.food_name, image: updateFood.image, category: updateFood.category, quantity: updateFood.quantity, price: updateFood.price, addby: updateFood.addby, food_origin: updateFood.food_origin, description: updateFood.description
        },
      };
      const result = await foodCollection.updateOne(filter, food, options)
      res.send(result);
    })

    app.delete('/food/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await foodCollection.deleteOne(query);
      res.send(result)
    })

    //my food details

    app.get('/myfood/:email', logger, async (req, res) => {
      const email = req.params.email;
      // if(req.email !==req.user.email){
      //   return res.status(403).send({message:"forbidden access"})
      // }
      const query = { email: email }
      const cursor = foodCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })


  
    app.put('/myfood/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateFood = req.body;
      const food = {
        $set: {
          food_name: updateFood.food_name, image: updateFood.image, email: updateFood.email, category: updateFood.category, quantity: updateFood.quantity, price: updateFood.price, addby: updateFood.addby, food_origin: updateFood.food_origin, description: updateFood.description
        },
      };
      const result = await foodCollection.updateOne(filter, food, options)
      res.send(result);
    })


    //fetch food by name
    app.get('/foodname/:food_name', async (req, res) => {
      const food_name = req.params.food_name;
      const query = { food_name: food_name }
      const cursor = foodCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })
    
    app.get('/topSell', async (req, res) => {
      const pipeline = [
        { $group: { _id: "$food_name",  count: { $sum: 1 } } },
    ];
    // Execute the aggregation
    const aggCursor = myOrderCollection.aggregate(pipeline);
    const result= await aggCursor.toArray();
    res.send(result)
    })
    app.get('/foodcount',async(req,res)=>{
      const count=await foodCollection.estimatedDocumentCount()
      res.send({count})
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





app.get('/', (req, res) => {
  res.send('Restaurant management is running')
})

app.listen(port, () => {
  console.log(`Restaurant management is running on port:  ${port}`)
})