const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const resourcesController = require("../controllers/resourcesController");

// Home page route
router.get("/", homeController.getHomePage);

// Resources routes
router.get("/resources", resourcesController.getResourcesPage);
router.get("/resources/all", resourcesController.getAllArticles);
router.get("/resources/:slug", resourcesController.getBlogPost);

// Information routes
router.get("/awareness", homeController.getAwarenessPage);
router.get("/authorities", homeController.getAuthoritiesPage);

module.exports = router;
