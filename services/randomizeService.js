/**
 * Service for handling employee randomization logic
 */
const randomizeService = {
  /**
   * Get a random sample of employees for drug testing
   * @param {Array} employees - Array of eligible employee objects
   * @param {number} count - Number of employees to randomize
   * @returns {Array} Array of randomly selected employees
   */
  getRandomEmployees: (employees, count) => {
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return [];
    }

    // Ensure count doesn't exceed available employees
    const sampleSize = Math.min(count, employees.length);

    // Use Fisher-Yates (Knuth) shuffle algorithm to randomize the entire array
    const shuffled = [...employees];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return the first 'count' elements from the shuffled array
    return shuffled.slice(0, sampleSize);
  },

  /**
   * Get a stratified random sample of employees based on departments
   * @param {Array} employees - Array of eligible employee objects
   * @param {number} count - Total number of employees to randomize
   * @param {Object} departmentWeights - Optional weights for departments (default is proportional)
   * @returns {Array} Array of randomly selected employees with department representation
   */
  getStratifiedRandomEmployees: (
    employees,
    count,
    departmentWeights = null
  ) => {
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return [];
    }

    // Group employees by department
    const departmentGroups = {};
    employees.forEach((employee) => {
      const dept = employee.department || "Unassigned";
      if (!departmentGroups[dept]) {
        departmentGroups[dept] = [];
      }
      departmentGroups[dept].push(employee);
    });

    const departments = Object.keys(departmentGroups);

    // Calculate how many to select from each department
    let departmentCounts = {};

    if (departmentWeights) {
      // Use provided weights
      const totalWeight = Object.values(departmentWeights).reduce(
        (sum, weight) => sum + weight,
        0
      );

      departments.forEach((dept) => {
        const weight = departmentWeights[dept] || 0;
        departmentCounts[dept] = Math.round((weight / totalWeight) * count);
      });
    } else {
      // Proportional selection based on department size
      departments.forEach((dept) => {
        const deptSize = departmentGroups[dept].length;
        const proportion = deptSize / employees.length;
        departmentCounts[dept] = Math.round(proportion * count);
      });
    }

    // Adjust counts to ensure we get exactly the requested number
    const initialTotal = Object.values(departmentCounts).reduce(
      (sum, c) => sum + c,
      0
    );
    let difference = count - initialTotal;

    // Add or remove from departments as needed
    while (difference !== 0) {
      const operation = difference > 0 ? 1 : -1;

      // Find department with most/least employees depending on direction
      const deptsBySize = departments.sort((a, b) => {
        if (difference > 0) {
          // For adding, prioritize departments with most eligible employees
          return departmentGroups[b].length - departmentGroups[a].length;
        } else {
          // For removing, prioritize departments with most selected employees
          return departmentCounts[b] - departmentCounts[a];
        }
      });

      // Adjust first valid department
      for (const dept of deptsBySize) {
        // Don't select more than available or reduce below zero
        if (
          (operation > 0 &&
            departmentCounts[dept] < departmentGroups[dept].length) ||
          (operation < 0 && departmentCounts[dept] > 0)
        ) {
          departmentCounts[dept] += operation;
          difference -= operation;
          break;
        }
      }

      // Safety check to prevent infinite loop
      if (
        deptsBySize.every(
          (dept) =>
            (operation > 0 &&
              departmentCounts[dept] >= departmentGroups[dept].length) ||
            (operation < 0 && departmentCounts[dept] <= 0)
        )
      ) {
        break;
      }
    }

    // Select random employees from each department
    const selectedEmployees = [];

    departments.forEach((dept) => {
      const deptEmployees = departmentGroups[dept];
      const deptCount = departmentCounts[dept];

      if (deptCount > 0 && deptEmployees.length > 0) {
        const randomDeptEmployees = randomizeService.getRandomEmployees(
          deptEmployees,
          deptCount
        );
        selectedEmployees.push(...randomDeptEmployees);
      }
    });

    return selectedEmployees;
  },
};

module.exports = randomizeService;
