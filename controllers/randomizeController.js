const Employee = require("../models/Employee");
const RandomizedEmployee = require("../models/RandomizedEmployee");
const randomizeService = require("../services/randomizeService");
const excelExporter = require("../utils/excelExporter");

/**
 * Controller handling employee randomization for drug testing
 */
const randomizeController = {
  /**
   * Render the randomize page
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getRandomizePage: (req, res) => {
    try {
      // Get all employees and already randomized employees for this year
      const allEmployees = Employee.getAllEmployees();
      const randomizedIds =
        RandomizedEmployee.getCurrentYearRandomizedEmployeeIds();
      const eligibleEmployees = Employee.getEligibleEmployees(randomizedIds);

      res.render("admin/randomize", {
        title: "Randomize Employees",
        totalEmployees: allEmployees.length,
        eligibleCount: eligibleEmployees.length,
        randomizedCount: randomizedIds.length,
        message: req.session.message || null,
      });

      // Clear any existing message
      delete req.session.message;
    } catch (error) {
      console.error("Error rendering randomize page:", error);
      res.status(500).render("errors/500", {
        title: "Server Error",
        error: process.env.NODE_ENV === "production" ? {} : error,
      });
    }
  },

  /**
   * Process employee randomization
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  randomizeEmployees: (req, res) => {
    try {
      const { count } = req.body;
      const numEmployees = parseInt(count, 10);

      if (isNaN(numEmployees) || numEmployees < 1) {
        req.session.message = {
          type: "error",
          text: "Please enter a valid number of employees",
        };
        return res.redirect("/admin/randomize");
      }

      // Get eligible employees (not randomized this year)
      const randomizedIds =
        RandomizedEmployee.getCurrentYearRandomizedEmployeeIds();
      const eligibleEmployees = Employee.getEligibleEmployees(randomizedIds);

      if (eligibleEmployees.length === 0) {
        req.session.message = {
          type: "error",
          text: "No eligible employees available for randomization",
        };
        return res.redirect("/admin/randomize");
      }

      if (numEmployees > eligibleEmployees.length) {
        req.session.message = {
          type: "error",
          text: `Only ${eligibleEmployees.length} eligible employees available. Please enter a smaller number.`,
        };
        return res.redirect("/admin/randomize");
      }

      // Randomize employees
      const randomizedEmployees = randomizeService.getRandomEmployees(
        eligibleEmployees,
        numEmployees
      );

      // Save the randomized employees
      const saved =
        RandomizedEmployee.saveRandomizedEmployees(randomizedEmployees);

      if (saved) {
        req.session.message = {
          type: "success",
          text: `Successfully randomized ${randomizedEmployees.length} employees for drug testing`,
        };

        // Store the randomized employees in session for display
        req.session.lastRandomized = randomizedEmployees;

        res.redirect("/admin/randomized-employees");
      } else {
        req.session.message = {
          type: "error",
          text: "Error saving randomized employees",
        };
        res.redirect("/admin/randomize");
      }
    } catch (error) {
      console.error("Error randomizing employees:", error);
      req.session.message = {
        type: "error",
        text: "Error processing randomization: " + error.message,
      };
      res.redirect("/admin/randomize");
    }
  },

  /**
   * Display randomized employees
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getRandomizedEmployees: (req, res) => {
    try {
      // If we have just randomized employees, use those
      const randomizedEmployees = req.session.lastRandomized || [];
      delete req.session.lastRandomized;

      // If no recent randomization, get all randomized employees for the current year
      const allRandomizedThisYear =
        randomizedEmployees.length === 0
          ? RandomizedEmployee.getCurrentYearRandomizedEmployees()
          : randomizedEmployees;

      res.render("admin/randomized-employees", {
        title: "Randomized Employees",
        employees: allRandomizedThisYear,
        isNewRandomization: randomizedEmployees.length > 0,
        message: req.session.message || null,
      });

      // Clear any existing message
      delete req.session.message;
    } catch (error) {
      console.error("Error displaying randomized employees:", error);
      res.status(500).render("errors/500", {
        title: "Server Error",
        error: process.env.NODE_ENV === "production" ? {} : error,
      });
    }
  },

  /**
   * Export randomized employees to Excel
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  exportToExcel: async (req, res) => {
    try {
      // Get all randomized employees for the current year
      const randomizedEmployees =
        RandomizedEmployee.getCurrentYearRandomizedEmployees();

      if (randomizedEmployees.length === 0) {
        req.session.message = {
          type: "error",
          text: "No randomized employees to export",
        };
        return res.redirect("/admin/randomized-employees");
      }

      // Generate Excel file
      const excelBuffer = await excelExporter.generateExcel(
        randomizedEmployees
      );

      // Set headers for file download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=randomized_employees_${new Date().getFullYear()}.xlsx`
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
      res.redirect("/admin/randomized-employees");
    }
  },
};

module.exports = randomizeController;
