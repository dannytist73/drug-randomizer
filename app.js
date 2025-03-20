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

// Load environment variables
dotenv.config();

// Ensure data directories exist
ensureDataDirectories();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
if (process.env.NODE_ENV === "production") {
  mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDB Connected");

      // Import and run admin creation
      const { createAdminUser } = require("./routes/mongodbRoutes");
      createAdminUser();
    })
    .catch((err) => {
      console.error("MongoDB Connection Error:", err.message);
    });
}

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

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
