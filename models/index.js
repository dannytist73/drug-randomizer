const mongoose = require("mongoose");

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

// Helper functions
async function createAdminUser() {
  try {
    const Admin = models.Admin;
    const adminExists = await Admin.findOne({
      username: process.env.ADMIN_USERNAME,
    });

    if (!adminExists) {
      const bcrypt = require("bcrypt");
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

module.exports = {
  Admin: models.Admin,
  createAdminUser,
};
