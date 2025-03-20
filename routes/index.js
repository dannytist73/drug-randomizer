const express = require("express");
const router = express.Router();
const homeRoutes = require("./homeRoutes");
const adminRoutes = require("./adminRoutes");
const mongodbRoutes = require("./mongodbRoutes");

// Home routes
router.use("/", homeRoutes);

// Admin routes
router.use("/admin", adminRoutes);

// MongoDB routes
router.use("/mongodb", mongodbRoutes);

module.exports = router;
