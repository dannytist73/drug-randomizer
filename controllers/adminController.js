const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Admin } = require("../models/index");
const { isProduction, getModel } = require("../utils/database");
const Employee = isProduction
  ? require("../models/mongodb/Employee")
  : require("../models/Employee");
const RandomizedEmployee = isProduction
  ? require("../models/mongodb/RandomizedEmployee")
  : require("../models/RandomizedEmployee");
const csvService = require("../services/csvService");
const excelExporter = require("../utils/excelExporter");

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
    if (req.session && req.session.isAuthenticated) {
      console.log("User already authenticated, redirecting to dashboard");
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
      console.log("Login attempt received");
      const { username, password } = req.body;

      // Try environment variables first (for backward compatibility)
      if (
        process.env.ADMIN_USERNAME &&
        process.env.ADMIN_PASSWORD &&
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
      ) {
        console.log("Login successful via env variables");

        // Wait for the session to be saved before redirecting
        return new Promise((resolve) => {
          req.session.isAuthenticated = true;
          req.session.user = {
            username,
            loginTime: new Date().toISOString(),
          };

          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              req.session.loginError = "Session error: " + err.message;
              resolve(res.redirect("/admin/login"));
            } else {
              console.log("Session successfully saved, redirecting...");
              // Add a small delay to ensure session is fully persisted
              setTimeout(() => {
                resolve(res.redirect("/admin/dashboard"));
              }, 100);
            }
          });
        });
      }

      // Check database for admin user
      console.log("Checking database for user:", username);
      const admin = await Admin.findOne({ username });
      console.log("Admin found in database:", !!admin);

      if (admin) {
        // Check password
        const passwordMatch = await bcrypt.compare(password, admin.password);
        console.log("Password match:", passwordMatch);

        if (passwordMatch) {
          console.log("Setting authenticated session");

          // Wait for the session to be saved before redirecting
          return new Promise((resolve) => {
            req.session.isAuthenticated = true;
            req.session.user = {
              username: admin.username,
              loginTime: new Date().toISOString(),
            };

            req.session.save((err) => {
              if (err) {
                console.error("Session save error:", err);
                req.session.loginError = "Session error: " + err.message;
                resolve(res.redirect("/admin/login"));
              } else {
                console.log("Session successfully saved, redirecting...");
                setTimeout(() => {
                  resolve(res.redirect("/admin/dashboard"));
                }, 100);
              }
            });
          });
        }
      }

      console.log("Authentication failed for user:", username);
      req.session.loginError = "Invalid username or password";
      return res.redirect("/admin/login");
    } catch (error) {
      console.error("Login error:", error);
      req.session.loginError =
        "An error occurred during login: " + error.message;
      return res.redirect("/admin/login");
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
      console.log(
        "Loading dashboard. User authenticated:",
        req.session.isAuthenticated
      );

      // Get employee statistics
      let allEmployees = [];
      let randomizedThisYear = [];

      if (isProduction) {
        // In production, methods return promises
        allEmployees = await Employee.getAllEmployees();
        randomizedThisYear =
          await RandomizedEmployee.getCurrentYearRandomizedEmployees();
      } else {
        // In development, methods return values directly
        allEmployees = Employee.getAllEmployees();
        randomizedThisYear =
          RandomizedEmployee.getCurrentYearRandomizedEmployees();
      }

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
        if (isProduction) {
          allEmployeesData = await Employee.getAllEmployees();
        } else {
          allEmployeesData = Employee.getAllEmployees();
        }
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
      let saved;
      if (isProduction) {
        saved = await Employee.saveEmployees(allEmployeesData);
      } else {
        saved = Employee.saveEmployees(allEmployeesData);
      }

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
  getEmployees: async (req, res) => {
    try {
      let employees;
      if (isProduction) {
        employees = await Employee.getAllEmployees();
      } else {
        employees = Employee.getAllEmployees();
      }

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
  deleteAllEmployees: async (req, res) => {
    try {
      // Check if randomized data should also be deleted
      const deleteRandomized = req.body.deleteRandomized === "true";

      // Delete employees data
      let employeesDeleted;
      let randomizedDeleted = false;

      if (isProduction) {
        employeesDeleted = await Employee.deleteAllEmployees();

        // Delete randomized data if requested
        if (deleteRandomized) {
          randomizedDeleted =
            await RandomizedEmployee.deleteAllRandomizedEmployees();
        }
      } else {
        employeesDeleted = Employee.deleteAllEmployees();

        // Delete randomized data if requested
        if (deleteRandomized) {
          randomizedDeleted = RandomizedEmployee.deleteAllRandomizedEmployees();
        }
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
  deleteEmployee: async (req, res) => {
    try {
      const employeeId = req.params.id;

      if (!employeeId) {
        req.session.message = {
          type: "error",
          text: "Employee ID is required",
        };
        return res.redirect("/admin/employees");
      }

      let deleted;
      if (isProduction) {
        deleted = await Employee.deleteEmployeeById(employeeId);
      } else {
        deleted = Employee.deleteEmployeeById(employeeId);
      }

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
      let employees;
      if (isProduction) {
        employees = await Employee.getAllEmployees();
      } else {
        employees = Employee.getAllEmployees();
      }

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
