const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Create admin schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create model
const Admin = mongoose.model("Admin", adminSchema);

// Create admin user if it doesn't exist
async function createAdminUser() {
  try {
    const adminExists = await Admin.findOne({
      username: process.env.ADMIN_USERNAME,
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const admin = new Admin({
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
      });
      await admin.save();
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Call createAdminUser function
createAdminUser();

// Setup a diagnostic route
router.get("/create-admin", async (req, res) => {
  try {
    await createAdminUser();
    res.send("Admin user creation process completed. Check logs for details.");
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

// Export the Admin model and router
module.exports = router;
module.exports.Admin = Admin;
module.exports.adminSchema = adminSchema;
