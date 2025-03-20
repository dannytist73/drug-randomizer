const fs = require("fs");
const path = require("path");

/**
 * RandomizedEmployee model for tracking employees selected for drug testing
 */
class RandomizedEmployee {
  constructor() {
    this.filePath = path.join(__dirname, "../data/randomized_employees.json");
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
   * Get all randomized employees
   * @returns {Array} Array of randomized employee objects
   */
  getAllRandomizedEmployees() {
    try {
      const data = fs.readFileSync(this.filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading randomized employees data:", error);
      return [];
    }
  }

  /**
   * Get randomized employees for the current year
   * @returns {Array} Array of randomized employee objects for current year
   */
  getCurrentYearRandomizedEmployees() {
    const currentYear = new Date().getFullYear();
    const allRandomized = this.getAllRandomizedEmployees();

    return allRandomized.filter(
      (employee) =>
        new Date(employee.randomizedDate).getFullYear() === currentYear
    );
  }

  /**
   * Get IDs of employees randomized in the current year
   * @returns {Array} Array of employee IDs
   */
  getCurrentYearRandomizedEmployeeIds() {
    const currentYearEmployees = this.getCurrentYearRandomizedEmployees();
    return currentYearEmployees.map((employee) => employee.employeeId);
  }

  /**
   * Save newly randomized employees
   * @param {Array} employees - Array of employee objects with full details
   * @returns {boolean} Success status
   */
  saveRandomizedEmployees(employees) {
    try {
      // Get existing randomized employees
      const existingRandomized = this.getAllRandomizedEmployees();

      // Create randomized employee records with timestamp
      const now = new Date();
      const randomizedEmployees = employees.map((employee) => ({
        employeeId: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        position: employee.position,
        randomizedDate: now.toISOString(),
        year: now.getFullYear(),
      }));

      // Combine existing and new randomized employees
      const updatedRandomized = [...existingRandomized, ...randomizedEmployees];

      // Save to file
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(updatedRandomized, null, 2)
      );
      return true;
    } catch (error) {
      console.error("Error saving randomized employees data:", error);
      return false;
    }
  }

  /**
   * Delete all randomized employees
   * @returns {boolean} Success status
   */
  deleteAllRandomizedEmployees() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
      return true;
    } catch (error) {
      console.error("Error deleting all randomized employees:", error);
      return false;
    }
  }

  /**
   * Delete randomized entries for a specific employee
   * @param {string} employeeId - Employee ID
   * @returns {boolean} Success status
   */
  deleteRandomizedEmployeeById(employeeId) {
    try {
      const randomizedEmployees = this.getAllRandomizedEmployees();
      const filteredEmployees = randomizedEmployees.filter(
        (employee) => employee.employeeId !== employeeId
      );

      // If lengths are the same, no employee was found to delete
      if (filteredEmployees.length === randomizedEmployees.length) {
        return false;
      }

      fs.writeFileSync(
        this.filePath,
        JSON.stringify(filteredEmployees, null, 2)
      );
      return true;
    } catch (error) {
      console.error(
        `Error deleting randomized employee with ID ${employeeId}:`,
        error
      );
      return false;
    }
  }
}

module.exports = new RandomizedEmployee();
