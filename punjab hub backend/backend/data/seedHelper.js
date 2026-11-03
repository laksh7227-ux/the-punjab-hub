import mongoose from "mongoose";
import { seedUsers, seedBusinesses } from "./seedData.js";

export async function seedMongoIfEmpty() {
  try {
    if (mongoose.connection.readyState !== 1) return;

    const userCount = await mongoose.connection.collection("users").countDocuments();
    if (userCount === 0) {
      console.log("🌱 Populating empty MongoDB with initial users...");
      await mongoose.connection.collection("users").insertMany(seedUsers);
      console.log("✅ Seeded initial users in MongoDB.");
    }

    const businessCount = await mongoose.connection.collection("businesses").countDocuments();
    if (businessCount === 0) {
      console.log("🌱 Populating empty MongoDB with Punjab manufacturers...");
      await mongoose.connection.collection("businesses").insertMany(seedBusinesses);
      console.log("✅ Seeded 6 verified Punjab manufacturer listings in MongoDB.");
    }
  } catch (error) {
    console.warn("Notice during MongoDB seed check:", error.message);
  }
}
