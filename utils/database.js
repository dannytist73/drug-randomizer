const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Get MongoDB connection string from environment variable
const MONGODB_URI = process.env.MONGODB_URI;

// Determine if we're in production (Vercel) or development
const isProduction = process.env.NODE_ENV === "production";

// Connection timeout settings
mongoose.set("bufferTimeoutMS", 60000); // Increase timeout to 60 seconds

// Variable to track connection state
let isConnecting = false;
let connectionPromise = null;

/**
 * Connect to MongoDB with retry logic
 * @returns {Promise} MongoDB connection
 */
async function connectToMongoDB() {
  if (connectionPromise) return connectionPromise;

  if (isProduction && MONGODB_URI) {
    console.log("Connecting to MongoDB...");
    isConnecting = true;

    connectionPromise = mongoose
      .connect(MONGODB_URI, {
        // Modern connection options (removed deprecated options)
        serverSelectionTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 45000, // 45 seconds
        connectTimeoutMS: 30000, // 30 seconds
      })
      .then(() => {
        console.log("Connected to MongoDB");
        isConnecting = false;
        return mongoose.connection;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        isConnecting = false;
        connectionPromise = null;
        throw err;
      });

    return connectionPromise;
  }

  return null;
}

// Connect to MongoDB if in production
if (isProduction && MONGODB_URI) {
  connectToMongoDB().catch((err) => {
    console.error("Initial MongoDB connection failed:", err);
  });
}

/**
 * Ensure MongoDB is connected
 * @returns {Promise} Resolves when connected
 */
async function ensureConnection() {
  if (!isProduction || !MONGODB_URI) return null;

  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connecting, wait for it
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  // Otherwise, try to connect
  return connectToMongoDB();
}

// Helper function to determine which model to use based on environment
const getModel = (modelName) => {
  if (isProduction && MONGODB_URI) {
    // Use MongoDB models in production
    return require(`../models/mongodb/${modelName}`);
  } else {
    // Use file-based models in development
    return require(`../models/${modelName}`);
  }
};

module.exports = {
  getModel,
  isProduction,
  connectToMongoDB,
  ensureConnection,
};
