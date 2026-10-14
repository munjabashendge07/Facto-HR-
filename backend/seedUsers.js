import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { seedDefaultUsers } from "./utils/seedDefaults.js";

dotenv.config();

const runSeed = async () => {
  try {
    await connectDB();
    await seedDefaultUsers();
    console.log("Seeding process completed cleanly without deleting existing records.");
  } catch (error) {
    console.error("Seed script error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

runSeed();