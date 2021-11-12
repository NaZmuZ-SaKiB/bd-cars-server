require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.oscgv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const runServer = async () => {
    try {
        await client.connect();
        const database = client.db('BD_Cars');
        const carCollection = database.collection('Cars');
        const reviewCollection = database.collection('Reviews');
        const userCollection = database.collection('Users');
        const orderCollection = database.collection('Orders');

        // Get Cars
        app.get('/cars', async (req, res) => {
            const limit = parseInt(req?.query?.limit);

            const cursor = await carCollection.find({});
            let cars;

            if (limit) {
                cars = await cursor.limit(limit).toArray();
            }
            else {
                cars = await cursor.toArray();
            }

            res.json(cars)
        })

        // Get One Car
        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;

            const car = await carCollection.findOne({ _id: ObjectId(id) });
            res.json(car);
        })

        // Get Reviews
        app.get('/reviews', async (req, res) => {
            const cursor = await reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
        })

        // Post Reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const response = await reviewCollection.insertOne(review);
            res.json(response);
        })

        // Get User
        app.get('/users', async (req, res) => {
            const email = req.query?.email;
            const role = req.query?.role;

            if (email) {
                const user = await userCollection.findOne({ email });
                res.json(user);
            }
            else if (role) {
                const cursor = await userCollection.find({ role });
                const users = await cursor.toArray();
                res.json(users);
            }
            else {
                const cursor = await userCollection.find({});
                const users = await cursor.toArray();
                res.json(users);
            }
        })

        // Post User
        app.post('/users', async (req, res) => {
            const user = req.body;
            const response = await userCollection.insertOne(user);
            res.json(response);
        })

        // Update User
        app.put('/users/phone/:id', async (req, res) => {
            const id = req.params?.id;
            const phone = req.body.phone;
            const filter = { _id: ObjectId(id) }
            const doc = { $set: { phone: phone } }

            const response = await userCollection.updateOne(filter, doc);
            res.json(response);

        })

        app.put('/users/address/:id', async (req, res) => {
            const id = req.params?.id;
            const address = req.body.address;
            const filter = { _id: ObjectId(id) }
            const doc = { $set: { address: address } }

            const response = await userCollection.updateOne(filter, doc);
            res.json(response);

        })

        app.put('/users/admin/:email', async (req, res) => {
            const email = req.params?.email;
            const filter = { email }
            const doc = { $set: { role: 'admin' } }

            const response = await userCollection.updateOne(filter, doc);
            res.json(response);

        })

        // Post Order
        app.post('/orders', async (req, res) => {
            const order = req.body;

            const response = await orderCollection.insertOne(order);

            res.json(response);
        })

        // Get Order
        app.get('/orders', async (req, res) => {
            const email = req.query?.email;
            let cursor;

            if (email) {
                cursor = await orderCollection.find({ email });
            }
            else {
                cursor = await orderCollection.find({ status: 'Pending' });
            }

            const orders = await cursor.toArray();

            res.json(orders);
        })

        // Update Order
        app.put('/orders/:id', async (req, res) => {
            const id = req.params?.id;
            const status = req.query?.status;
            const filter = { _id: ObjectId(id) };
            const doc = { $set: { status: status } };
            console.log(id, status)
            const response = await orderCollection.updateOne(filter, doc);
            res.json(response);
        })
    }
    finally {
        // client.close();
    }
}

app.get('/', (req, res) => {
    res.send('Helllooooo Server');
})

runServer().catch(console.dir);



app.listen(PORT, console.log('listening to port', PORT));