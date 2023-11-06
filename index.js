const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000;


// middleware 
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lapzl7c.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();
        // Send a ping to confirm a successful connection
        const jobCollection = client.db("hireHarbor").collection("jobs")
        const categoryCollection = client.db("hireHarbor").collection("category")
        const appliedJobCollection = client.db("hireHarbor").collection("appliedJobs")


        // job and category related api

        app.post("/jobs", async (req, res) => {
            const job = req.body;
            console.log(job);
            const result = await jobCollection.insertOne(job)
            res.send(result)
        })
        app.get("/jobs/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobCollection.findOne(query)
            res.send(result)
        })

        app.get("/jobs", async (req, res) => {
            console.log(req.query.email);
            let query = {}
            if (req.query?.email) {
                query = { userEmail: req.query.email }
            }
            const cursor = jobCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
       
        app.put("/jobs/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateJob = req.body
            const newJob = {
                $set: {
                    Posted_by: updateJob.Posted_by,
                    Job_Title: updateJob.Job_Title,
                    Job_Posting_Date: updateJob.Job_Posting_Date,
                    Application_Deadline: updateJob.Application_Deadline,
                    Salary_Range: updateJob.Salary_Range,
                    Job_Applicants_Number: updateJob.Job_Applicants_Number,
                    Job_Type: updateJob.Job_Type,
                    Job_Image: updateJob.Job_Image, 
                    Job_Description: updateJob.Job_Description, 
                    userEmail: updateJob.userEmail
                }
            }
            const result = await jobCollection.updateOne(query, newJob, options)
            res.send(result)
        })

        app.get("/category", async (req, res) => {
            const cursor = categoryCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        // applied Job related Api
        app.post("/applied-job", async (req, res) => {
            const appliedJob = req.body;
            const result = await appliedJobCollection.insertOne(appliedJob)
            res.send(result)
        })
        app.get("/applied-job", async (req, res) => {
            // console.log(req.query.email)
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const cursor = appliedJobCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get("/", (req, res) => {
    res.send("Hire Harbor is Running...")
})
app.listen(port, () => {
    console.log(`Hire Harbor is running on port ${port}`);
})