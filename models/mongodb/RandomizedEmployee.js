/**
 * MongoDB implementation of RandomizedEmployee model
 */
const mongoose = require("mongoose");

// Schema definition
const randomizedEmployeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  name: String,
  department: String,
  position: String,
  randomizedDate: {
    type: Date,
    default: Date.now,
  },
  year: Number,
});

// Get the model (or create if it doesn't exist)
const RandomizedEmployeeModel =
  mongoose.models.RandomizedEmployee ||
  mongoose.model("RandomizedEmployee", randomizedEmployeeSchema);

/**
 * MongoDB-compatible RandomizedEmployee model with same API as file-based version
 */
const RandomizedEmployee = {
  /**
   * Get all randomized employees
   * @returns {Array} Array of randomized employee objects
   */
  getAllRandomizedEmployees: function () {
    try {
      return RandomizedEmployeeModel.find().lean().exec() || [];
    } catch (error) {
      console.error("Error getting all randomized employees:", error);
      return [];
    }
  },

  /**
   * Get randomized employees for the current year
   * @returns {Array} Array of randomized employee objects for current year
   */
  getCurrentYearRandomizedEmployees: function () {
    try {
      const currentYear = new Date().getFullYear();
      return (
        RandomizedEmployeeModel.find({ year: currentYear }).lean().exec() || []
      );
    } catch (error) {
      console.error("Error getting current year randomized employees:", error);
      return [];
    }
  },

  /**
   * Get IDs of employees randomized in the current year
   * @returns {Array} Array of employee IDs
   */
  getCurrentYearRandomizedEmployeeIds: function () {
    try {
      const currentYear = new Date().getFullYear();
      const employees =
        RandomizedEmployeeModel.find(
          { year: currentYear },
          { employeeId: 1, _id: 0 }
        )
          .lean()
          .exec() || [];

      return employees.map((employee) => employee.employeeId);
    } catch (error) {
      console.error(
        "Error getting current year randomized employee IDs:",
        error
      );
      return [];
    }
  },

  /**
   * Save newly randomized employees
   * @param {Array} employees - Array of employee objects with full details
   * @returns {boolean} Success status
   */
  saveRandomizedEmployees: function (employees) {
    try {
      // Create randomized employee records with timestamp
      const now = new Date();
      const randomizedEmployees = employees.map((employee) => ({
        employeeId: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        position: employee.position,
        randomizedDate: now,
        year: now.getFullYear(),
      }));

      // Insert new randomized employees
      RandomizedEmployeeModel.insertMany(randomizedEmployees, (err) => {
        if (err) {
          console.error("Error inserting randomized employees:", err);
          return false;
        }
      });

      return true;
    } catch (error) {
      console.error("Error saving randomized employees data:", error);
      return false;
    }
  },

  /**
   * Delete all randomized employees
   * @returns {boolean} Success status
   */
  deleteAllRandomizedEmployees: function () {
    try {
      RandomizedEmployeeModel.deleteMany({}, (err) => {
        if (err) {
          console.error("Error deleting all randomized employees:", err);
          return false;
        }
      });
      return true;
    } catch (error) {
      console.error("Error deleting all randomized employees:", error);
      return false;
    }
  },

  /**
   * Delete randomized entries for a specific employee
   * @param {string} employeeId - Employee ID
   * @returns {boolean} Success status
   */
  deleteRandomizedEmployeeById: function (employeeId) {
    try {
      RandomizedEmployeeModel.deleteMany({ employeeId }, (err) => {
        if (err) {
          console.error(
            `Error deleting randomized employee with ID ${employeeId}:`,
            err
          );
          return false;
        }
      });
      return true;
    } catch (error) {
      console.error(
        `Error deleting randomized employee with ID ${employeeId}:`,
        error
      );
      return false;
    }
  },
};

module.exports = RandomizedEmployee;
