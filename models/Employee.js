const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { isProduction, getModel } = require("../utils/database");

// If in production, use MongoDB model
if (isProduction) {
  module.exports = getModel("Employee");
} else {
  class Employee {
    constructor() {
      this.filePath = path.join(__dirname, "../data/employees.json");
      this.ensureDataFileExists();
    }

    /**
     * Ensure the data file exists, create it if it doesn't
     */
    ensureDataFileExists() {
      const dirPath = path.dirname(this.filePath);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, JSON.stringify([]));
      }
    }

    /**
     * Get all employees
     * @returns {Array} Array of employee objects
     */
    getAllEmployees() {
      try {
        const data = fs.readFileSync(this.filePath, "utf8");
        return JSON.parse(data);
      } catch (error) {
        console.error("Error reading employees data:", error);
        return [];
      }
    }

    /**
     * Save employees data from CSV
     * @param {Array} employees - Array of employee objects
     * @returns {boolean} Success status
     */
    saveEmployees(employees) {
      try {
        // Add unique IDs to new employees if they don't have one
        const employeesWithIds = employees.map((employee) => {
          if (!employee.id) {
            return { ...employee, id: uuidv4() };
          }
          return employee;
        });

        fs.writeFileSync(
          this.filePath,
          JSON.stringify(employeesWithIds, null, 2)
        );
        return true;
      } catch (error) {
        console.error("Error saving employees data:", error);
        return false;
      }
    }

    /**
     * Find employees that haven't been randomized in the current year
     * @param {Array} randomizedEmployeeIds - Array of IDs of employees already randomized this year
     * @returns {Array} Array of employees eligible for randomization
     */
    getEligibleEmployees(randomizedEmployeeIds) {
      const allEmployees = this.getAllEmployees();

      // Filter out employees that have already been randomized this year
      return allEmployees.filter(
        (employee) => !randomizedEmployeeIds.includes(employee.id)
      );
    }

    /**
     * Find an employee by ID
     * @param {string} id - Employee ID
     * @returns {Object|null} Employee object or null if not found
     */
    getEmployeeById(id) {
      const employees = this.getAllEmployees();
      return employees.find((employee) => employee.id === id) || null;
    }

    /**
     * Delete all employees
     * @returns {boolean} Success status
     */
    deleteAllEmployees() {
      try {
        fs.writeFileSync(this.filePath, JSON.stringify([]));
        return true;
      } catch (error) {
        console.error("Error deleting all employees:", error);
        return false;
      }
    }

    /**
     * Delete an employee by ID
     * @param {string} id - Employee ID
     * @returns {boolean} Success status
     */
    deleteEmployeeById(id) {
      try {
        const employees = this.getAllEmployees();
        const filteredEmployees = employees.filter(
          (employee) => employee.id !== id
        );

        // If lengths are the same, no employee was found to delete
        if (filteredEmployees.length === employees.length) {
          return false;
        }

        fs.writeFileSync(
          this.filePath,
          JSON.stringify(filteredEmployees, null, 2)
        );
        return true;
      } catch (error) {
        console.error(`Error deleting employee with ID ${id}:`, error);
        return false;
      }
    }
  }

  module.exports = new Employee();
}
