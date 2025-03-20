/**
 * MongoDB implementation of Employee model
 */
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Schema definition
const employeeSchema = new mongoose.Schema({
  id: String,
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  employeeId: String,
  department: String,
  position: String,
  email: String,
  phone: String,
  joinDate: Date,
});

// Get the model (or create if it doesn't exist)
const EmployeeModel =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

/**
 * MongoDB-compatible Employee model with the same API as file-based version
 */
const Employee = {
  /**
   * Get all employees
   * @returns {Array} Array of employee objects
   */
  getAllEmployees: function () {
    try {
      return EmployeeModel.find().lean().exec() || [];
    } catch (error) {
      console.error("Error getting all employees:", error);
      return [];
    }
  },

  /**
   * Save employees data
   * @param {Array} employees - Array of employee objects
   * @returns {boolean} Success status
   */
  saveEmployees: function (employees) {
    try {
      // Add unique IDs to new employees if they don't have one
      const employeesWithIds = employees.map((employee) => {
        if (!employee.id) {
          return { ...employee, id: uuidv4() };
        }
        return employee;
      });

      // Clear existing employees and insert new ones
      EmployeeModel.deleteMany({}, (err) => {
        if (err) {
          console.error("Error deleting existing employees:", err);
          return false;
        }

        EmployeeModel.insertMany(employeesWithIds, (err) => {
          if (err) {
            console.error("Error inserting employees:", err);
            return false;
          }
        });
      });

      return true;
    } catch (error) {
      console.error("Error saving employees data:", error);
      return false;
    }
  },

  /**
   * Find employees that haven't been randomized in the current year
   * @param {Array} randomizedEmployeeIds - Array of IDs of employees already randomized this year
   * @returns {Array} Array of employees eligible for randomization
   */
  getEligibleEmployees: function (randomizedEmployeeIds) {
    try {
      return (
        EmployeeModel.find({
          id: { $nin: randomizedEmployeeIds },
        })
          .lean()
          .exec() || []
      );
    } catch (error) {
      console.error("Error getting eligible employees:", error);
      return [];
    }
  },

  /**
   * Find an employee by ID
   * @param {string} id - Employee ID
   * @returns {Object|null} Employee object or null if not found
   */
  getEmployeeById: function (id) {
    try {
      return EmployeeModel.findOne({ id }).lean().exec() || null;
    } catch (error) {
      console.error(`Error getting employee with ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Delete all employees
   * @returns {boolean} Success status
   */
  deleteAllEmployees: function () {
    try {
      EmployeeModel.deleteMany({}, (err) => {
        if (err) {
          console.error("Error deleting all employees:", err);
          return false;
        }
      });
      return true;
    } catch (error) {
      console.error("Error deleting all employees:", error);
      return false;
    }
  },

  /**
   * Delete an employee by ID
   * @param {string} id - Employee ID
   * @returns {boolean} Success status
   */
  deleteEmployeeById: function (id) {
    try {
      EmployeeModel.deleteOne({ id }, (err) => {
        if (err) {
          console.error(`Error deleting employee with ID ${id}:`, err);
          return false;
        }
      });
      return true;
    } catch (error) {
      console.error(`Error deleting employee with ID ${id}:`, error);
      return false;
    }
  },
};

module.exports = Employee;
