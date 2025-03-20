require("dotenv").config();

const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;
const MongoStore = require("connect-mongo");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const routes = require("./routes");
const ensureDataDirectories = require("./ensure-data-dir");
const {
  isProduction,
  ensureConnection,
  connectToMongoDB,
} = require("./utils/database");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - critical for secure cookies behind proxies (like Vercel)
app.set("trust proxy", 1);

// Ensure data directories exist
ensureDataDirectories();

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

// CORS headers for cross-origin requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Set up sessions with MongoDB store
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    collectionName: "sessions",
    touchAfter: 24 * 3600, // Only update sessions once per day unless data changes
    ttl: 60 * 60 * 24, // 1 day in seconds
    autoRemove: "native",
    crypto: {
      secret: process.env.SESSION_SECRET || "your-secret-key",
    },
  }),
  cookie: {
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
  },
};

app.use(session(sessionConfig));

// Middleware to ensure MongoDB connection before proceeding with requests
app.use(async (req, res, next) => {
  if (isProduction) {
    try {
      // Ensure MongoDB is connected
      await ensureConnection();
      next();
    } catch (err) {
      console.error("Database connection error:", err);
      res.status(500).render("errors/500", {
        title: "Database Connection Error",
        error: isProduction ? {} : err,
      });
    }
  } else {
    next();
  }
});

// Global middleware for user data
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Debug route for authentication
app.get("/debug-auth", async (req, res) => {
  try {
    // Get Admin model safely
    let adminModel = null;
    let adminCount = 0;
    let adminExists = null;
    let models = [];

    if (mongoose.connection.readyState === 1) {
      adminModel = mongoose.models.Admin;
      models = Object.keys(mongoose.models);

      if (adminModel) {
        try {
          adminCount = await adminModel.countDocuments();
          adminExists = await adminModel.findOne({
            username: process.env.ADMIN_USERNAME || "admin",
          });
        } catch (err) {
          console.error("Error querying Admin model:", err);
        }
      }
    }

    res.json({
      session: {
        id: req.sessionID || "none",
        isAuthenticated: req.session?.isAuthenticated || false,
        user: req.session?.user || null,
      },
      mongoConnection: {
        readyState: mongoose.connection.readyState,
        states: {
          0: "disconnected",
          1: "connected",
          2: "connecting",
          3: "disconnecting",
          99: "uninitialized",
        },
        stateDesc:
          [
            "disconnected",
            "connected",
            "connecting",
            "disconnecting",
            "uninitialized",
          ][mongoose.connection.readyState] || "unknown",
      },
      models: models,
      adminModelExists: !!adminModel,
      adminCount: adminCount,
      adminExists: !!adminExists,
      adminUsername: adminExists ? adminExists.username : null,
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        isProduction: isProduction,
        hasUsername: !!process.env.ADMIN_USERNAME,
        hasPassword: !!process.env.ADMIN_PASSWORD,
        hasMongoDB: !!process.env.MONGODB_URI,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Reset admin password endpoint
app.get("/reset-admin-password", async (req, res) => {
  try {
    if (isProduction) {
      await ensureConnection();
    }

    const Admin = mongoose.model("Admin");
    const bcrypt = require("bcrypt");

    // Find admin user
    const admin = await Admin.findOne({ username: "admin" });

    if (!admin) {
      // Create admin if it doesn't exist
      const hashedPassword = await bcrypt.hash("drugtest2025", 10);
      const newAdmin = new Admin({
        username: "admin",
        password: hashedPassword,
      });
      await newAdmin.save();
      return res.send("Admin user created with password 'drugtest2025'");
    }

    // Update password for existing admin
    const hashedPassword = await bcrypt.hash("drugtest2025", 10);
    admin.password = hashedPassword;
    await admin.save();

    res.send("Admin password reset to 'drugtest2025'");
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

// Additional helper endpoint to diagnose MongoDB connection
app.get("/ping-db", async (req, res) => {
  try {
    if (isProduction) {
      if (mongoose.connection.readyState !== 1) {
        await connectToMongoDB();
      }
      // Try a simple operation
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      res.json({
        status: "success",
        connected: true,
        collections: collections.map((c) => c.name),
        readyState: mongoose.connection.readyState,
      });
    } else {
      res.json({
        status: "success",
        mode: "development",
        fileSystem: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      stack: error.stack,
    });
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
    error: isProduction ? {} : err,
  });
});

// Create admin user and start server in development
// In production (Vercel), this doesn't run because serverless functions don't stay running
if (!isProduction) {
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  // In production, try connecting to MongoDB early
  connectToMongoDB()
    .then(async () => {
      console.log("MongoDB connected during startup");

      // Try to create admin user
      try {
        const { createAdminUser } = require("./models/index");
        await createAdminUser();
      } catch (error) {
        console.error("Error creating admin user during startup:", error);
      }
    })
    .catch((err) => {
      console.error("MongoDB connection failed during startup:", err);
    });
}

module.exports = app;
