const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Create model schemas only once
const models = {};

// Admin model
if (!models.Admin) {
  const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  });

  // Check if model already exists before creating
  models.Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
}

/**
 * Create admin user with better error handling for serverless environments
 * @returns {Promise<boolean>} True if admin exists or was created
 */
async function createAdminUser() {
  // Check if the connection is ready before proceeding
  if (mongoose.connection.readyState !== 1) {
    console.log("Waiting for MongoDB connection before creating admin user...");
    // Wait up to 5 seconds for connection to be ready
    for (let i = 0; i < 50; i++) {
      if (mongoose.connection.readyState === 1) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB connection not ready after waiting");
    }
  }

  try {
    const Admin = models.Admin;

    // First check if admin already exists
    const adminExists = await Admin.findOne({
      username: process.env.ADMIN_USERNAME || "admin",
    });

    if (!adminExists) {
      // Create admin if it doesn't exist
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || "drugtest2025",
        10
      );

      const admin = new Admin({
        username: process.env.ADMIN_USERNAME || "admin",
        password: hashedPassword,
      });

      await admin.save();
      console.log("Admin user created successfully");
      return true;
    } else {
      console.log("Admin user already exists");
      return true;
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    return false;
  }
}

module.exports = {
  Admin: models.Admin,
  createAdminUser,
};
