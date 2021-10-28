const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.e3jxy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('volunteer-network');
        const eventsCollection = database.collection('events');
        const volunteersCollection = database.collection('volunteers');

        // GET API
        app.get('/events', async (req, res) => {
            const cursor = eventsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let events = [];
            const count = await cursor.count();
            if (page) {
                events = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                events = await cursor.toArray();
            }
            res.send({
                count,
                events
            });
        })
        app.get('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const student = await eventsCollection.findOne(query);
            res.send(student);
        })
        // POST API
        app.post('/events', async (req, res) => {
            const newStudent = req.body;
            const result = await eventsCollection.insertOne(newStudent);
            res.json(result);
        })
        // UPDATE API
        app.put('/events/:id', async (req, res) => {
            const id = req.params.id;
            const updateStudent = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upset: true };
            const updateDoc = {
                $set: {
                    name: updateStudent.name,
                    email: updateStudent.email
                },
            }
            const result = await eventsCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.json(result);
        })
        // DELETE API
        app.delete('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await eventsCollection.deleteOne(query);
            res.json(result);
        })

        // POST USER API
        app.post('/volunteer', async (req, res) => {
            const newVolunteer = req.body;
            const result = await volunteersCollection.insertOne(newVolunteer);
            res.json(result);
        })

        // GET USER API
        app.get('/volunteer', async (req, res) => {
            const cursor = volunteersCollection.find({});
            volunteers = await cursor.toArray();
            res.send(volunteers);
        })

        // DELETE USER API
        app.delete('/volunteer/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await volunteersCollection.deleteOne(query);
            res.json(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('This is home');
});

app.get('/test', (req, res) => {
    res.send('This is test');
});

app.listen(port, () => {
    console.log('server is up and running at', port);
})