
import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define MONGODB_URI in your environment variables."
  );
}

// Store the validated URI as a guaranteed string.
const mongoUri: string = MONGODB_URI;

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached =
  global.mongooseCache ??
  (global.mongooseCache = {
    conn: null,
    promise: null,
  });

async function connectDB(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri);
  }

  cached.conn = await cached.promise;

  return cached.conn;
}

export default connectDB;
