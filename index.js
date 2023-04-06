const express = require("express");
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
//middle ware
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const password = process.env.DB_PASSWORD;
const user = process.env.DB_USER;
const uri = `mongodb+srv://${user}:${password}@cluster0.ke5ipc3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try{
        const database = client.db("Manufacture_MC");
        const toolsCollection = database.collection("tools");
        const orderCollection = database.collection("order");

        app.get("/tools",async(req,res)=>{
            const query={}
              const users = await toolsCollection.find(query).toArray();
              res.send(users);
        })
        app.get("/purchase/:id",async(req,res)=>{
            const id = req.params.id;
            const query={_id: new ObjectId(id)}
            const result = await toolsCollection.findOne(query)
            res.send(result);
          })
        app.post("/order",async(req,res)=>{
          const {id,product,singlePrice,quantity,email,phone,shipping,shippingCost,available_quantity}= req.body;
          const order={
            product_id: id,
            product,
            singlePrice,
            available_quantity,
            quantity,
            email,
            phone,
            shipping,
            shippingCost,
            total: (quantity*singlePrice)+shippingCost
          }
          const filter={_id: new ObjectId(id)}
          const updateDoc = {
            $set: {
              available_quantity: available_quantity-quantity
            },
          };
          const upResult = await toolsCollection.updateOne(filter, updateDoc);
          const result = await orderCollection.insertOne(order);
          res.send(result)
        })
        app.get("/order/:email",async(req,res)=>{
          const email= req.params.email;
          const filter = {email: email}
          const result = await orderCollection.find(filter).toArray();
          res.send(result)
        })
        app.delete("/order/:id",async(req,res)=>{
          const id= req.params.id;
          const filter = {_id: new ObjectId(id)}
          const result = await orderCollection.deleteOne(filter);
          res.send(result)
        })
        app.post("/updateQuantity/:id",async(req,res)=>{
          const cancelOrder = req.body;
          const filter = {_id: new ObjectId(cancelOrder.product_id)}
          const result1 = await toolsCollection.findOne(filter)
          const updateDoc = {
            $set: {
              available_quantity: result1.available_quantity + parseInt(cancelOrder.quantity)
            },
          };
          const result = await toolsCollection.updateOne(filter, updateDoc);
          res.send(result)
        })
    }
    finally{

    }
}

run().catch(console.dir);
app.get("/", (req, res) => {
    res.send("Manufacture-site Server is running");
  });
  app.listen(port, () => {
    console.log("Server is running on port", port);
  });