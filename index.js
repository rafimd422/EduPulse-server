const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_KEY}@cluster0.sopxnju.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db("userData");
    const userCollection = database.collection("user");
    const TeacherRequest = database.collection("TeacherRequest");
    const classReqCollection = database.collection("classReqCollection");


    app.get("/user", async (req, res) => {
      const user = req.body;

      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/user", async (req, res) => {
      const user = req.body;
      if (user.email) {
        query = { email: user.email };
      }
      const alreadyExistUser = await userCollection.findOne(query);
      if (alreadyExistUser) {
        return res.send({ message: "user already exist" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.patch("/user/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/teacherRequest", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const result = await TeacherRequest.find(query).toArray();
      res.send(result);
    });

    app.post("/teacherRequest", async (req, res) => {
      const user = req.body;
      const result = await TeacherRequest.insertOne(user);
      console.log(result);
      res.send(result);
    });

    app.patch("/teacherRequest/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const findEmail = await TeacherRequest.findOne(filter);
      const query = { email: findEmail.email };

      const updateDoc = {
        $set: {
          status: "approved",
        },
      };
      const result = await TeacherRequest.updateOne(filter, updateDoc);

      if (result?.modifiedCount > 0) {
        const updateUserDoc = {
          $set: {
            role: "Teacher",
          },
        };
        const userResult = await userCollection.updateOne(query, updateUserDoc);
        res.json({
          TeacherRequest: result,
          userCollection: userResult,
        });
      }
    });

    app.patch("/teacherRequest/reject/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "rejected",
        },
      };
      const result = await TeacherRequest.updateOne(filter, updateDoc);

      res.send(result);
    });

// class requests api

// classReqCollection
app.get("/classreq", async (req, res) => {
  let query = {};
  if (req.query.email) {
    query = { email: req.query.email };
  }
  const result = await classReqCollection.find(query).toArray();
  res.send(result);
});

app.post("/classreq", async (req, res) => {
  const user = req.body;
  const result = await classReqCollection.insertOne(user);
  console.log(result);
  res.send(result);
});









    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Edupulse server is running...");
});

app.listen(port, () => {
  console.log(`Edupulse server is Running on port ${port}`);
});
