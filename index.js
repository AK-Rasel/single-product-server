const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@single-product-1.0t8uz5o.mongodb.net/?retryWrites=true&w=majority&appName=single-product-1`;

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
    await client.connect();
    // Send a ping to confirm a successful connection

    const productCollection = client
      .db("single-product")
      .collection("products");

    const cartDataCollection = client.db("single-product").collection("carts");
    // show all data
    app.get("/api/v1/products", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });
    app.get("/api/v1/cart", async (req, res) => {
      const result = await cartDataCollection.find().toArray();
      res.send(result);
    });
    // add to cart

    app.put("/api/v1/cart/:id", async (req, res) => {
      const id = req.params.id;
      const cartData = req.body;
      const { quantity } = cartData; // Assuming `cartData` contains `id` and `quantity`

      try {
        const objectId = new ObjectId(id);

        const existingProduct = await cartDataCollection.findOne({
          _id: objectId,
        });

        if (existingProduct) {
          // Update the quantity if the product already exists in the cart
          // console.log("existingProduct");
          const result = await cartDataCollection.updateOne(
            { _id: objectId },
            { $inc: { quantity: parseInt(quantity) } }
          );
          // console.log("Update result:", result);
          res.status(200).send({ message: "Product quantity updated" });
        } else {
          // Insert the full product data na thake in the cart
          cartData._id = objectId; // Ensure the _id is set correctly
          const result = await cartDataCollection.insertOne(cartData);
          // console.log("Insert result:", result); // Log the result for debugging
          res.status(200).send({ message: "Product added to cart" });
        }
      } catch (error) {
        console.error("Error updating cart:", error); // Log the error for debugging
        res.status(500).send({ message: "Error updating cart", error: error });
      }
    });

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
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
