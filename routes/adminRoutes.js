const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const randomizeController = require("../controllers/randomizeController");
const authMiddleware = require("../middleware/authMiddleware");

// Admin login routes
router.get("/login", adminController.getLoginPage);
router.post("/login", adminController.postLogin);
router.get("/logout", authMiddleware.isAuthenticated, adminController.logout);

// Admin dashboard routes (protected by authentication)
router.get(
  "/dashboard",
  authMiddleware.isAuthenticated,
  adminController.getDashboard
);

// CSV upload and management routes
router.post(
  "/upload-csv",
  authMiddleware.isAuthenticated,
  adminController.uploadCSV
);
router.get(
  "/employees",
  authMiddleware.isAuthenticated,
  adminController.getEmployees
);

// Employee deletion routes
router.post(
  "/delete-all-employees",
  authMiddleware.isAuthenticated,
  adminController.deleteAllEmployees
);
router.post(
  "/delete-employee/:id",
  authMiddleware.isAuthenticated,
  adminController.deleteEmployee
);

// Export routes
router.get(
  "/export-employees-excel",
  authMiddleware.isAuthenticated,
  adminController.exportEmployeesToExcel
);

// Randomize routes
router.get(
  "/randomize",
  authMiddleware.isAuthenticated,
  randomizeController.getRandomizePage
);
router.post(
  "/randomize",
  authMiddleware.isAuthenticated,
  randomizeController.randomizeEmployees
);
router.get(
  "/randomized-employees",
  authMiddleware.isAuthenticated,
  randomizeController.getRandomizedEmployees
);

// Export routes
router.get(
  "/export-excel",
  authMiddleware.isAuthenticated,
  randomizeController.exportToExcel
);

module.exports = router;
