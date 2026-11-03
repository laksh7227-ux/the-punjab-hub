import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedUsers, seedBusinesses } from "../data/seedData.js";
import store from "../data/localStore.js";

dotenv.config();

async function runSeed() {
  console.log("🌱 Running PunjabHub AI database seed...");

  // Seed local store
  store.data.users = JSON.parse(JSON.stringify(seedUsers));
  store.data.businesses = JSON.parse(JSON.stringify(seedBusinesses));
  store.save();
  console.log("✅ Local store seeded with 2 users and 6 Punjab manufacturers.");

  // Check if MongoDB is reachable
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/punjabhub_ai";
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("Connected to MongoDB. Seeding collections...");
    await mongoose.connection.collection("users").deleteMany({});
    await mongoose.connection.collection("users").insertMany(seedUsers);
    await mongoose.connection.collection("businesses").deleteMany({});
    await mongoose.connection.collection("businesses").insertMany(seedBusinesses);
    console.log("✅ MongoDB collections seeded successfully.");
    await mongoose.disconnect();
  } catch (err) {
    console.log(`ℹ️ MongoDB was not reached (${err.message}). Local store is ready for standalone operation.`);
  }

  console.log("\nDefault credentials:");
  console.log("👑 Admin: admin@punjabhub.ai / AdminPassword123!");
  console.log("🏭 Manufacturer: gurpreet@ludhianawoolens.com / Password123!\n");
  process.exit(0);
}

runSeed();
