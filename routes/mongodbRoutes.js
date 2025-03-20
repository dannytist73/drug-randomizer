const express = require("express");
const router = express.Router();
const { Admin, createAdminUser } = require("../models/index");

// Setup a diagnostic route
router.get("/create-admin", async (req, res) => {
  try {
    await createAdminUser();
    res.send("Admin user creation process completed. Check logs for details.");
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

// Add a debug route
router.get("/debug", async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    const admin = await Admin.findOne({ username: process.env.ADMIN_USERNAME });

    res.json({
      adminCount,
      adminExists: !!admin,
      adminUsername: admin ? admin.username : null,
      mongooseModels: Object.keys(mongoose.models),
    });
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

module.exports = router;
