require("dotenv").config();

const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;
const MongoStore = require("connect-mongo");
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const routes = require("./routes");
const ensureDataDirectories = require("./ensure-data-dir");

// Ensure data directories exist
ensureDataDirectories();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
if (process.env.NODE_ENV === "production") {
  mongoose
    .connect(MONGODB_URI, {})
    .then(() => {
      console.log("MongoDB Connected");

      // Import and run admin creation from the central models registry
      const { createAdminUser } = require("./models/index");
      createAdminUser();
    })
    .catch((err) => {
      console.error("MongoDB Connection Error:", err.message);
    });
}

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// setup express-ejs-layouts
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // Extend to 24 hours from the current 24 hours
      httpOnly: true,
    },
  })
);

// Global middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.get("/debug-auth", async (req, res) => {
  try {
    const adminModel = mongoose.models.Admin;
    let adminExists = null;
    let adminCount = 0;

    if (adminModel) {
      try {
        adminCount = await adminModel.countDocuments();
        adminExists = await adminModel.findOne({
          username: process.env.ADMIN_USERNAME,
        });
      } catch (err) {
        console.error("Error querying Admin model:", err);
      }
    }

    res.json({
      session: {
        id: req.session?.id,
        isAuthenticated: req.session?.isAuthenticated,
        user: req.session?.user,
      },
      mongoConnected: mongoose.connection?.readyState === 1,
      models: Object.keys(mongoose.models),
      adminModelExists: !!adminModel,
      adminCount: adminCount,
      adminExists: !!adminExists,
      adminUsername: adminExists ? adminExists.username : null,
      envVars: {
        nodeEnv: process.env.NODE_ENV,
        hasUsername: !!process.env.ADMIN_USERNAME,
        hasPassword: !!process.env.ADMIN_PASSWORD,
        hasMongoDB: !!process.env.MONGODB_URI,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Routes
app.use("/", routes);

// Error handling middleware
app.use((req, res) => {
  res.status(404).render("errors/404", {
    title: "Page Not Found",
    path: req.path,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errors/500", {
    title: "Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
