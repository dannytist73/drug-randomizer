const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Get MongoDB connection string from environment variable
const MONGODB_URI = process.env.MONGODB_URI;

// Determine if we're in production (Vercel) or development
const isProduction = process.env.NODE_ENV === "production";

// Connect to MongoDB if in production
if (isProduction && MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI, {})
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });
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
};
