/**
 * Utility for validating data
 */
const validator = {
  /**
   * Validate employee data
   * @param {Object} employee - Employee object to validate
   * @returns {boolean} Whether the employee data is valid
   */
  validateEmployee: (employee) => {
    // Check required fields
    if (!employee.firstName || !employee.lastName) {
      return false;
    }

    // Ensure the employee has either an id or employeeId
    if (!employee.id && !employee.employeeId) {
      return false;
    }

    // Additional validation can be added as needed

    return true;
  },

  /**
   * Validate email address format
   * @param {string} email - Email address to validate
   * @returns {boolean} Whether the email format is valid
   */
  validateEmail: (email) => {
    if (!email) return true; // Email can be empty

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Whether the phone format is valid
   */
  validatePhone: (phone) => {
    if (!phone) return true; // Phone can be empty

    // Simple validation - can be expanded based on requirements
    return phone.replace(/[^0-9]/g, "").length >= 7;
  },

  /**
   * Validate date format
   * @param {string} dateStr - Date string to validate
   * @returns {boolean} Whether the date format is valid
   */
  validateDate: (dateStr) => {
    if (!dateStr) return true; // Date can be empty

    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  },
};

module.exports = validator;
