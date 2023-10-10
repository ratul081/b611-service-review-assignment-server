const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');
require('colors');
const { MongoClient, ServerApiVersion } = require('mongodb');
// const jwt = require('jsonwebtoken')
// require('dotenv').config();
app.use(cors())
app.use(express.json())


// Database authentication
const db_User = "volunteer_network"
const db_Password = "6TP9emlkz7QSbjP4"


//MongoDB conection
const uri = `mongodb+srv://${db_User}:${db_Password}@cluster0.xige0uf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function dbConnect() {
  try {
    await client.connect();
    console.log("Database connected".yellow);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
}
dbConnect()

//Database
const database = client.db('b611-service-review-assignment_db')
const services = database.collection('b611-service-review-assignment_services');
const servicesReviews = database.collection('b611-service-review-assignment_services_reviews');
const serviceOrders = database.collection('b611-service-review-assignment_service_orders')

//endpoints
app.get('/', (req, res) => {
  res.send("Bhoj Shala server is running")
})


app.get('/services_home', async (req, res) => {
  try {
    const query = {}
    const cursor = services.find(query)
    const data = await cursor.limit(3).toArray()
    // console.log("🚀 ~ file: index.js:64 ~ app.get ~ data:", result)
    res.send({
      status: true,
      massage: "Successfully got the data",
      data: data
    })
  }
  catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});
app.get('/services', async (req, res) => {
  try {
    // const page = parseInt(req.query.page)
    // const size = parseInt(req.query.size)
    // const skipNumber = page * size
    const query = {}
    const cursor = services.find(query)
    const result = await cursor.toArray()
    console.log("🚀 ~ file: index.js:64 ~ app.get ~ data:", result)
    // const cursor = services.find(query)
    // const count = await services.estimatedDocumentCount()
    // const data = await cursor.skip(skipNumber).limit(size).toArray()
    res.send({
      status: true,
      massage: "Successfully got the data",
      // data: { count, services }
      data: result
    })
  }
  catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.post("/orders", async (req, res) => {
  try {
    const user = req.body;
    console.log("🚀 ~ file: index.js:103 ~ app.post ~ user:", user)
    res.send(user)
  }
  catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
})
app.post("/my_reviews", async (req, res) => {
  try {
    const review = req.body;
    console.log("🚀 ~ file: index.js:103 ~ app.post ~ review:", review)
    res.send(review)
  }
  catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
})
// app.get("/order", async (req, res) => {
//   try {

//   }
//   catch (error) {
//     console.log(error.name.bgRed, error.message.bold);
//     res.send({
//       success: false,
//       error: error.message,
//     });
//   }
// })


app.listen(port, () => {
  console.log(`listening on port ${port}`);
})
