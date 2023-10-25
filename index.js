const express = require('express');
const cors = require('cors');
const brandsData = require('./brandData.json')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// midleware........
app.use(cors());
app.use(express.json());

app.get('/brands', (req, res) => {
    res.send(brandsData)
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.USER_PASS}@cluster0.hmuvaqm.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const productCollection = client.db('productDB').collection('products')
        const cartCollection = client.db('productDB').collection('cart')

        app.get('/products', async (req, res) => {
            const cursor = productCollection.find()
            const result = await cursor.toArray()
            // console.log(result);
            res.send(result)
        })

        app.get('/products/:brand', async (req, res) => {
            const brandName = req.params.brand;
            const query = { brand: (brandName) }
            const coursor = productCollection.find(query)
            const result = await coursor.toArray()
            res.send(result)
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query)
            res.send(result)
        })

        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            // console.log(newProduct);
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateProduct = req.body;
            const updateProductNew = {
                $set: {
                    name: updateProduct.name,
                    brand: updateProduct.brand,
                    price: updateProduct.price,
                    rating: updateProduct.rating,
                    image: updateProduct.image,
                    type: updateProduct.type
                }
            }
            const result = await productCollection.updateOne(filter, updateProductNew, options)
            res.send(result)
        })

        // cart API ................

        app.get('/cart', async (req, res) => {
            const cursor = cartCollection.find();
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/cart', async (req, res) => {
            const cart = req.body;
            const result = await cartCollection.insertOne(cart)
            res.send(result)
        })

        app.delete('/cart/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: id}
            const result = await cartCollection.deleteOne(query);
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




app.get('/', (req, res) => {
    res.send('Hello Im runing too')
})

app.listen(port, () => {
    console.log(`assignment is runing on port: ${port}`);
})