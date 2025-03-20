const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Admin } = require("../models/index");
const Employee = require("../models/Employee");
const RandomizedEmployee = require("../models/RandomizedEmployee");
const csvService = require("../services/csvService");

/**
 * Controller for handling admin-related routes and functionality
 */
const adminController = {
  /**
   * Render the admin login page
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getLoginPage: (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.session.isAuthenticated) {
      return res.redirect("/admin/dashboard");
    }

    res.render("admin/login", {
      title: "Admin Login",
      error: req.session.loginError || null,
    });

    // Clear any existing error message
    delete req.session.loginError;
  },

  /**
   * Process admin login attempt
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  postLogin: async (req, res) => {
    try {
      const { username, password } = req.body;

      // First try environment variables (for backward compatibility)
      if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
      ) {
        req.session.isAuthenticated = true;
        req.session.user = { username };
        return res.redirect("/admin/dashboard");
      }

      // Then check database
      const admin = await Admin.findOne({ username });
      if (admin) {
        // If using hashed passwords
        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (passwordMatch) {
          req.session.isAuthenticated = true;
          req.session.user = { username: admin.username };
          return res.redirect("/admin/dashboard");
        }
      }

      return res.render("admin/login", {
        title: "Admin Login",
        error: "Invalid username or password",
        username,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.render("admin/login", {
        title: "Admin Login",
        error: "An error occurred during login",
        username: req.body.username,
      });
    }
  },

  /**
   * Process admin logout
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  logout: (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/admin/login");
    });
  },

  /**
   * Render admin dashboard
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getDashboard: async (req, res) => {
    try {
      // Get employee statistics
      const allEmployees = Employee.getAllEmployees();
      const randomizedThisYear =
        RandomizedEmployee.getCurrentYearRandomizedEmployees();

      // Calculate statistics
      const stats = {
        totalEmployees: allEmployees.length,
        randomizedThisYear: randomizedThisYear.length,
        eligibleEmployees: allEmployees.length - randomizedThisYear.length,
        lastUploadDate:
          allEmployees.length > 0
            ? new Date().toLocaleDateString()
            : "No data uploaded",
      };

      res.render("admin/dashboard", {
        title: "Admin Dashboard",
        stats,
        message: req.session.message || null,
      });

      // Clear any existing message
      delete req.session.message;
    } catch (error) {
      console.error("Error rendering dashboard:", error);
      res.status(500).render("errors/500", {
        title: "Server Error",
        error: process.env.NODE_ENV === "production" ? {} : error,
      });
    }
  },

  /**
   * Process CSV file upload
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadCSV: async (req, res) => {
    try {
      if (!req.files || !req.files.csvFile) {
        req.session.message = { type: "error", text: "No file uploaded" };
        return res.redirect("/admin/dashboard");
      }

      const csvFiles = Array.isArray(req.files.csvFile)
        ? req.files.csvFile
        : [req.files.csvFile];

      let totalEmployees = 0;
      let appendMode = req.body.appendMode === "true";
      let allEmployeesData = [];

      // If append mode is enabled and we already have employees, get them first
      if (appendMode) {
        allEmployeesData = Employee.getAllEmployees();
      }

      // Process each CSV file
      for (const csvFile of csvFiles) {
        // Check file type
        if (!csvFile.name.endsWith(".csv")) {
          req.session.message = {
            type: "error",
            text: `File ${csvFile.name} is not a CSV file. Please upload CSV files only.`,
          };
          return res.redirect("/admin/dashboard");
        }

        // Process CSV file
        const csvData = csvFile.data.toString("utf8");
        const employees = await csvService.parseCSV(csvData);

        if (employees.length === 0) {
          continue; // Skip empty files
        }

        // Add employees to our collection
        allEmployeesData.push(...employees);
        totalEmployees += employees.length;
      }

      if (totalEmployees === 0) {
        req.session.message = {
          type: "error",
          text: "No valid employee data found in the uploaded CSV file(s)",
        };
        return res.redirect("/admin/dashboard");
      }

      // Save all employees to the data store
      const saved = Employee.saveEmployees(allEmployeesData);

      if (saved) {
        req.session.message = {
          type: "success",
          text: `Successfully ${
            appendMode ? "added" : "imported"
          } ${totalEmployees} employees`,
        };
      } else {
        req.session.message = {
          type: "error",
          text: "Error saving employee data",
        };
      }

      res.redirect("/admin/dashboard");
    } catch (error) {
      console.error("Error uploading CSV:", error);
      req.session.message = {
        type: "error",
        text: "Error processing file: " + error.message,
      };
      res.redirect("/admin/dashboard");
    }
  },

  /**
   * Get all employees for display
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getEmployees: (req, res) => {
    try {
      const employees = Employee.getAllEmployees();

      res.render("admin/employees", {
        title: "Employee List",
        employees,
        message: req.session.message || null,
      });

      // Clear any existing message
      delete req.session.message;
    } catch (error) {
      console.error("Error getting employees:", error);
      res.status(500).render("errors/500", {
        title: "Server Error",
        error: process.env.NODE_ENV === "production" ? {} : error,
      });
    }
  },

  /**
   * Delete all employee data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteAllEmployees: (req, res) => {
    try {
      // Check if randomized data should also be deleted
      const deleteRandomized = req.body.deleteRandomized === "true";

      // Delete employees data
      const employeesDeleted = Employee.deleteAllEmployees();

      // Delete randomized data if requested
      let randomizedDeleted = false;
      if (deleteRandomized) {
        randomizedDeleted = RandomizedEmployee.deleteAllRandomizedEmployees();
      }

      if (employeesDeleted) {
        req.session.message = {
          type: "success",
          text: `Employee data deleted successfully${
            deleteRandomized ? ". Randomized employee data also deleted." : ""
          }`,
        };
      } else {
        req.session.message = {
          type: "error",
          text: "Error deleting employee data",
        };
      }

      res.redirect("/admin/employees");
    } catch (error) {
      console.error("Error deleting employees:", error);
      req.session.message = {
        type: "error",
        text: "Error deleting employee data: " + error.message,
      };
      res.redirect("/admin/employees");
    }
  },

  /**
   * Delete a specific employee by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteEmployee: (req, res) => {
    try {
      const employeeId = req.params.id;

      if (!employeeId) {
        req.session.message = {
          type: "error",
          text: "Employee ID is required",
        };
        return res.redirect("/admin/employees");
      }

      const deleted = Employee.deleteEmployeeById(employeeId);

      if (deleted) {
        req.session.message = {
          type: "success",
          text: "Employee deleted successfully",
        };
      } else {
        req.session.message = {
          type: "error",
          text: "Employee not found or could not be deleted",
        };
      }

      res.redirect("/admin/employees");
    } catch (error) {
      console.error("Error deleting employee:", error);
      req.session.message = {
        type: "error",
        text: "Error deleting employee: " + error.message,
      };
      res.redirect("/admin/employees");
    }
  },

  /**
   * Export all employees to Excel
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  exportEmployeesToExcel: async (req, res) => {
    try {
      const employees = Employee.getAllEmployees();

      if (employees.length === 0) {
        req.session.message = { type: "error", text: "No employees to export" };
        return res.redirect("/admin/employees");
      }

      // Generate Excel file using the excelExporter utility
      const excelBuffer = await excelExporter.generateEmployeesExcel(employees);

      // Set headers for file download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=all_employees_${
          new Date().toISOString().split("T")[0]
        }.xlsx`
      );
      res.setHeader("Content-Length", excelBuffer.length);

      // Send the buffer as the response
      return res.send(excelBuffer);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      req.session.message = {
        type: "error",
        text: "Error generating Excel file: " + error.message,
      };
      res.redirect("/admin/employees");
    }
  },
};

module.exports = adminController;
