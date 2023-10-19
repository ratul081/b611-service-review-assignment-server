const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("colors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
app.use(cors());
app.use(express.json());

//MongoDB connection

const uri = process.env.DB_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
  useNewUrlParser: true, useUnifiedTopology: true,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function dbConnect() {
  try {
    await client.connect();
    console.log("Database connected".yellow);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
}
dbConnect();

//Database
const database = client.db("b611-service-review-assignment_db");
const services = database.collection("b611-service-review-assignment_services");
const servicesReviews = database.collection(
  "b611-service-review-assignment_services_reviews"
);
const serviceOrders = database.collection(
  "b611-service-review-assignment_service_orders"
);

// middleware
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({
      message: "Unauthorized access",
    });
  }
  // console.log("🚀 ~ file: index.js:45 ~ verifyJWT ~ authHeader:", authHeader);
  const token = authHeader.split(" ")[1];
  try {
    // const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
    // req.decoded = decoded;
    // next();
    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
      // console.log("🚀 ~ file: index.js:50 ~ jwt.verify ~ err:", err);
      if (err) {
        return res.status(403).send({ message: "Unauthorized access 403" });
      }
      req.decoded = decoded;
      // console.log(decoded);
      next();
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
}
app.get("/yo", verifyJWT, (req, res) => {
  res.send("hi");
});

//endpoints
app.post("/jwt", (req, res) => {
  try {
    const user = req.body;
    // console.log("🚀 ~ file: index.js:78 ~ app.post ~ user:", user);
    const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
      expiresIn: "1h",
    });
    res.send({ token });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
});
app.get("/", (req, res) => {
  res.send("Bhoj Shala server is running");
});

app.get("/services_home", async (req, res) => {
  try {
    const query = {};
    const cursor = services.find(query);
    const data = await cursor.limit(3).toArray();
    // console.log("🚀 ~ file: index.js:64 ~ app.get ~ data:", result)
    res.send({
      status: true,
      massage: "Successfully got the data",
      data: data,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.get("/services", async (req, res) => {
  try {
    let page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    const query = {};
    const cursor = services.find(query);
    let skipNumber = page * size;
    const count = await services.estimatedDocumentCount();
    if (skipNumber >= count) {
      skipNumber = 0;
    }
    const data = await cursor.skip(skipNumber).limit(size).toArray();
    // console.log(
    //   `page= ${page} size= ${size} data = ${data.length} count=${count} skip= ${skipNumber}`
    // );
    res.send({
      status: true,
      massage: "Successfully got the data",
      data: { count, data },
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.get("/service/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const data = await services.findOne(query);
    // console.log("🚀 ~ file: index.js:78 ~ app.get ~ data:", data)
    res.send({
      status: true,
      massage: "Successfully got the data",
      data: data,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.get("/orders", verifyJWT, async (req, res) => {
  try {
    const decoded = req.decoded;
    if (decoded.email !== req.query.email) {
      res.status(403).send({ message: "unauthorized access" });
    }
    let query = {};
    if (req.query.email) {
      query = {
        ordered_persons_email: req.query.email,
      };
    }
    const cursor = serviceOrders.find(query);
    const result = await cursor.toArray();
    res.send({
      status: true,
      massage: "Successfully got the data",
      data: result,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.post("/orders", async (req, res) => {
  try {
    const orders = req.body;
    const result = await serviceOrders.insertOne(orders);
    res.send({
      status: true,
      massage: "Successfully got the data",
      data: result,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.delete("/orders/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // console.log("🚀 ~ file: index.js:176 ~ app.delete ~ id:", id);
    const query = { _id: new ObjectId(id) };
    const result = await serviceOrders.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.log("DELETE", error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.get("/reviews", async (req, res) => {
  try {
    const query = req.query;
    const cursor = servicesReviews.find(query);
    const data = await cursor.toArray();
    res.send({
      status: true,
      massage: "Successfully got the data",
      data: data,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.post("/reviews", async (req, res) => {
  try {
    const reviews = req.body;
    const result = await servicesReviews.insertOne(reviews);
    res.send({
      status: true,
      massage: "Successfully got the data",
      data: result,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.delete("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // console.log("🚀 ~ file: index.js:176 ~ app.delete ~ id:", id);
    const query = { _id: new ObjectId(id) };
    const result = await servicesReviews.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.log("DELETE", error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.get("/my_reviews", verifyJWT, async (req, res) => {
  try {
    const decoded = req.decoded;
    if (decoded.email !== req.query.email) {
      res.status(403).send({ message: "unauthorized access" });
    }
    let query = {};
    if (req.query.email) {
      query = {
        reviewed_persons_email: req.query.email,
      };
    }
    const cursor = servicesReviews.find(query);
    // console.log("🚀 ~ file: index.js:282 ~ app.get ~ cursor:", cursor)
    const result = await cursor.toArray();
    // console.log("🚀 ~ file: index.js:269 ~ app.get ~ result:", result)
    res.send({
      status: true,
      massage: "Successfully got the data",
      data: result,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.patch("/my_reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updatedData = req.body.updatedData
    const result = await servicesReviews.updateMany(filter, updatedData);
    res.send(result)
    // res.send(updatedData)
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

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
});
