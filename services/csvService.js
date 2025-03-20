const csv = require("csv-parser");
const { Readable } = require("stream");
const validator = require("../utils/validator");

/**
 * Service for handling CSV file operations
 */
const csvService = {
  /**
   * Parse CSV data into an array of employee objects
   * @param {string} csvData - CSV data as a string
   * @returns {Promise<Array>} Promise resolving to an array of employee objects
   */
  parseCSV: (csvData) => {
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = Readable.from([csvData]);

      stream
        .pipe(
          csv({
            mapHeaders: ({ header }) =>
              header.trim().toLowerCase().replace(/\s+/g, "_"),
          })
        )
        .on("data", (data) => {
          // Validate and normalize the data
          const employee = csvService.normalizeEmployeeData(data);

          if (employee) {
            results.push(employee);
          }
        })
        .on("end", () => {
          resolve(results);
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  },

  /**
   * Normalize and validate employee data from CSV
   * @param {Object} data - Raw employee data from CSV
   * @returns {Object|null} Normalized employee object or null if invalid
   */
  normalizeEmployeeData: (data) => {
    try {
      // Extract required fields (adjust based on your CSV structure)
      const employeeData = {
        id: data.id || data.employee_id || null,
        firstName: data.first_name || data.firstname || "",
        lastName: data.last_name || data.lastname || "",
        employeeId:
          data.employee_id || data.employeeid || data.employee_number || "",
        department: data.department || "",
        position: data.position || data.job_title || "",
        email: data.email || "",
        phone: data.phone || data.phone_number || "",
        joinDate: data.join_date || data.hire_date || "",
      };

      // Validate required fields
      if (!validator.validateEmployee(employeeData)) {
        return null;
      }

      return employeeData;
    } catch (error) {
      console.error("Error normalizing employee data:", error);
      return null;
    }
  },
};

module.exports = csvService;
