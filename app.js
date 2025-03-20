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

// Increase Mongoose buffer timeout
mongoose.set("bufferTimeoutMS", 30000);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - critical for secure cookies behind proxies (like Vercel)
app.set("trust proxy", 1);

// Ensure data directories exist
ensureDataDirectories();

// MongoDB connection cache for serverless environments
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using cached database connection");
    return cachedConnection;
  }

  console.log("Creating new database connection");
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });

    console.log("MongoDB Connected");
    cachedConnection = conn;

    // Import and create admin user after connection is established
    try {
      const { createAdminUser } = require("./models/index");
      await createAdminUser();
      console.log("Admin user creation completed");
    } catch (err) {
      console.error("Error creating admin user:", err);
    }

    return conn;
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    throw err;
  }
}

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Setup express-ejs-layouts
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "layouts/main");

// CORS headers - important for cross-origin requests
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

// Connect to database before setting up session
connectToDatabase()
  .then(() => {
    // Session configuration
    const sessionConfig = {
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: true, // CHANGED: Force session to be saved back to store
      saveUninitialized: true, // CHANGED: Save new sessions
      store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        collectionName: "sessions",
        ttl: 60 * 60 * 24,
        autoRemove: "native",
        touchAfter: 24 * 3600, // Only update sessions once per day unless data changes
      }),
      cookie: {
        secure: false, // CRITICAL: Changed to false for all environments as a test
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax", // CHANGED: Use lax for all environments as a test
      },
    };

    // Set up session middleware
    app.use(session(sessionConfig));

    // Add session debugging to response headers in non-production
    if (process.env.NODE_ENV !== "production") {
      app.use((req, res, next) => {
        res.setHeader("X-Session-ID", req.sessionID || "none");
        res.setHeader(
          "X-Is-Authenticated",
          req.session?.isAuthenticated || "false"
        );
        next();
      });
    }

    // Global middleware
    app.use(async (req, res, next) => {
      // Ensure DB connection is active for each request
      try {
        if (mongoose.connection.readyState !== 1) {
          await connectToDatabase();
        }
        res.locals.user = req.session.user || null;
        next();
      } catch (err) {
        console.error("Database connection error in middleware:", err);
        res.status(500).render("errors/500", {
          title: "Database Connection Error",
          error: process.env.NODE_ENV === "production" ? {} : err,
        });
      }
    });

    // Debug endpoints
    app.get("/debug-auth", async (req, res) => {
      try {
        const adminModel = mongoose.models.Admin;
        let adminExists = null;
        let adminCount = 0;

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

        res.json({
          session: {
            id: req.sessionID,
            isAuthenticated: req.session?.isAuthenticated || false,
            user: req.session?.user || null,
          },
          cookies: req.headers.cookie || "none",
          mongoConnected: mongoose.connection?.readyState === 1,
          models: Object.keys(mongoose.models),
          adminModelExists: !!adminModel,
          adminCount: adminCount,
          adminExists: !!adminExists,
          adminUsername: adminExists ? adminExists.username : null,
          envVars: {
            nodeEnv: process.env.NODE_ENV || "development",
            hasUsername: !!process.env.ADMIN_USERNAME,
            hasPassword: !!process.env.ADMIN_PASSWORD,
            hasMongoDB: !!process.env.MONGODB_URI,
          },
        });
      } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    // Session test endpoint
    app.get("/api/session-test", (req, res) => {
      // Try to set a value in the session
      if (!req.session.testValue) {
        req.session.testValue = Date.now();
      }

      res.json({
        sessionID: req.sessionID || "none",
        testValue: req.session.testValue || "none",
        isAuthenticated: req.session.isAuthenticated || false,
        user: req.session.user || null,
      });
    });

    // Routes
    app.use("/", routes);

    // Password reset endpoint
    app.get("/reset-admin-password", async (req, res) => {
      try {
        const Admin = mongoose.model("Admin");
        const bcrypt = require("bcrypt");

        // Find admin user
        const admin = await Admin.findOne({ username: "admin" });

        if (!admin) {
          // Create admin if it doesn't exist
          const newAdmin = new Admin({
            username: "admin",
            password: await bcrypt.hash("drugtest2025", 10),
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

    // Error handling middlewares
    app.use((req, res, next) => {
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
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB during startup:", err);
  });

module.exports = app;
