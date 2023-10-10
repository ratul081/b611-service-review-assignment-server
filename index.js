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
const data = require('./scr/BhojSala.json')


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
const volunteerServices = client.db('volunteer_network').collection('volunteer_services');
const volunteerOrders = client.db('volunteer_network').collection('volunteer_orders')











app.get('/', (req, res) => {
  res.send("Bhoj Shala server is running")
})
app.get('/services', (req, res) => {
  const homeData = data.slice(0, 3)
  res.send(homeData)
});
app.get('/foods', (req, res) => {
  const homeData = data
  res.send(homeData)
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
})
