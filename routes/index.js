const express = require("express");
const router = express.Router();
const homeRoutes = require("./homeRoutes");
const adminRoutes = require("./adminRoutes");

// Home routes
router.use("/", homeRoutes);

// Admin routes
router.use("/admin", adminRoutes);

module.exports = router;
