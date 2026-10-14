import mongoose from "mongoose";
import dns from "node:dns";

// Support networks/systems where local DNS cannot resolve SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if restricted in host environment
}

const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URL || "mongodb://127.0.0.1:27017/factohr";

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    // If in development and remote Atlas connection failed, try local MongoDB fallback
    if (
      process.env.NODE_ENV !== "production" &&
      mongoUri !== "mongodb://127.0.0.1:27017/factohr"
    ) {
      console.log("Attempting fallback to local MongoDB instance (mongodb://127.0.0.1:27017/factohr)...");
      try {
        const localConn = await mongoose.connect(
          "mongodb://127.0.0.1:27017/factohr"
        );
        console.log(`Fallback Local MongoDB Connected: ${localConn.connection.host}`);
        return localConn;
      } catch (localErr) {
        console.error("Local MongoDB fallback failed:", localErr.message);
      }
    }

    process.exit(1);
  }
};

export default connectDB;