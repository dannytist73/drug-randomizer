/**
 * Ensures that necessary data directories exist at application startup
 */
const fs = require("fs");
const path = require("path");

const ensureDataDirectories = () => {
  const dataDir = path.join(__dirname, "data");

  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    console.log("Creating data directory...");
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create employees.json if it doesn't exist
  const employeesFile = path.join(dataDir, "employees.json");
  if (!fs.existsSync(employeesFile)) {
    console.log("Creating initial employees data file...");
    fs.writeFileSync(employeesFile, JSON.stringify([]));
  }

  // Create randomized_employees.json if it doesn't exist
  const randomizedFile = path.join(dataDir, "randomized_employees.json");
  if (!fs.existsSync(randomizedFile)) {
    console.log("Creating initial randomized employees data file...");
    fs.writeFileSync(randomizedFile, JSON.stringify([]));
  }

  console.log("Data directories and files are ready.");
};

module.exports = ensureDataDirectories;
