import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://rbaskeyofficial:rbaskeyofficial@cluster0.lnstw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

if (!uri) {
  throw new Error('MongoDB connection string is missing.');
}

const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global;
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
