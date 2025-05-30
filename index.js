const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Job Portal is Cooking");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://job_db_portal:job_portal_pass_1258@cluster0.a3sz7ff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const jobCollection = client.db("job-portal").collection("jobs");
    const applicationCollection = client
      .db("job-portal")
      .collection("applicants");

    app.get("/jobs", async (req, res) => {
      // showing specific job poster

      const email = req.query.email;
      const query = {};

      if (email) {
        query.hr_email = email;
      }

      const cursor = jobCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(filter);
      res.send(result);
    });

    // applicants backend system

    app.post("/applications", async (req, res) => {
      const data = req.body;
      const result = await applicationCollection.insertOne(data);
      res.send(result);
    });

    app.get("/applications", async (req, res) => {
      const email = req.query.email;
      const query = {
        applicant: email,
      };
      const result = await applicationCollection.find(query).toArray();

      for (const application of result) {
        const jobId = application.jobId;
        const jobQuery = { _id: new ObjectId(jobId) };
        const job = await jobCollection.findOne(jobQuery);

        application.company = job.company;
        application.title = job.title;
        application.company_logo = job.company_logo;
      }

      res.send(result);
    });

    // recruiter backend system -------------------------------

    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    });

    app.get("/applications/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        jobId: id,
      };
      const result = await applicationCollection.find(query).toArray();
      res.send(result);
    });

    app.patch("/application/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: req.body,
        },
      };

      const result = await applicationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port);
