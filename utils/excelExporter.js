const ExcelJS = require("exceljs");

/**
 * Utility for exporting data to Excel format
 */
const excelExporter = {
  /**
   * Generate Excel file from randomized employee data
   * @param {Array} employees - Array of randomized employee objects
   * @returns {Promise<Buffer>} Excel file as a buffer
   */
  generateExcel: async (employees) => {
    // Create a new workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Drug Test Randomizer";
    workbook.lastModifiedBy = "Drug Test Randomizer";
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet("Randomized Employees");

    // Add headers
    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Department", key: "department", width: 20 },
      { header: "Position", key: "position", width: 25 },
      { header: "Randomized Date", key: "randomizedDate", width: 20 },
      { header: "Year", key: "year", width: 10 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    };

    // Add rows
    employees.forEach((employee) => {
      const formattedDate = employee.randomizedDate
        ? new Date(employee.randomizedDate).toLocaleDateString()
        : "N/A";

      worksheet.addRow({
        name:
          employee.name ||
          `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
        department: employee.department || "N/A",
        position: employee.position || "N/A",
        randomizedDate: formattedDate,
        year: employee.year || new Date().getFullYear(),
      });
    });

    // Add title and information
    const titleRow = worksheet.addRow(["Drug Test Randomization Results"]);
    titleRow.font = { bold: true, size: 16 };
    worksheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`);
    titleRow.alignment = { horizontal: "center" };

    // Add date generated
    const dateRow = worksheet.addRow([
      `Generated on: ${new Date().toLocaleDateString()}`,
    ]);
    worksheet.mergeCells(`A${dateRow.number}:E${dateRow.number}`);
    dateRow.alignment = { horizontal: "center" };

    // Move the title rows to the top by creating copies at the top
    const titleRowValues = titleRow.values.slice(); // Create a copy of values
    const dateRowValues = dateRow.values.slice(); // Create a copy of values

    // Delete them from the bottom
    worksheet.spliceRows(worksheet.rowCount - 1, 2);

    // Insert them at the top
    worksheet.spliceRows(1, 0, titleRowValues, dateRowValues);

    // Add space after title
    worksheet.spliceRows(3, 0, []);

    // Add summary row
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow([
      `Total Employees Randomized: ${employees.length}`,
    ]);
    summaryRow.font = { bold: true };
    worksheet.mergeCells(`A${summaryRow.number}:E${summaryRow.number}`);

    // Add borders
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 4 && rowNumber <= employees.length + 4) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    // Generate buffer
    return await workbook.xlsx.writeBuffer();
  },

  /**
   * Generate Excel file from all employee data
   * @param {Array} employees - Array of all employee objects
   * @returns {Promise<Buffer>} Excel file as a buffer
   */
  generateEmployeesExcel: async (employees) => {
    // Create a new workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Drug Test Randomizer";
    workbook.lastModifiedBy = "Drug Test Randomizer";
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet("All Employees");

    // Add headers
    worksheet.columns = [
      { header: "First Name", key: "firstName", width: 20 },
      { header: "Last Name", key: "lastName", width: 20 },
      { header: "Employee ID", key: "employeeId", width: 15 },
      { header: "Department", key: "department", width: 20 },
      { header: "Position", key: "position", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Join Date", key: "joinDate", width: 15 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    };

    // Add rows
    employees.forEach((employee) => {
      const formattedJoinDate = employee.joinDate
        ? new Date(employee.joinDate).toLocaleDateString()
        : "N/A";

      worksheet.addRow({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        employeeId: employee.employeeId || employee.id || "N/A",
        department: employee.department || "N/A",
        position: employee.position || "N/A",
        email: employee.email || "N/A",
        phone: employee.phone || "N/A",
        joinDate: formattedJoinDate,
      });
    });

    // Add title
    const titleRow = worksheet.addRow(["Employee Data"]);
    titleRow.font = { bold: true, size: 16 };
    worksheet.mergeCells(`A${titleRow.number}:H${titleRow.number}`);
    titleRow.alignment = { horizontal: "center" };

    // Add date generated
    const dateRow = worksheet.addRow([
      `Generated on: ${new Date().toLocaleDateString()}`,
    ]);
    worksheet.mergeCells(`A${dateRow.number}:H${dateRow.number}`);
    dateRow.alignment = { horizontal: "center" };

    // Move the title rows to the top by creating copies at the top
    const titleRowValues = titleRow.values.slice(); // Create a copy of values
    const dateRowValues = dateRow.values.slice(); // Create a copy of values

    // Delete them from the bottom
    worksheet.spliceRows(worksheet.rowCount - 1, 2);

    // Insert them at the top
    worksheet.spliceRows(1, 0, titleRowValues, dateRowValues);

    // Add space after title
    worksheet.spliceRows(3, 0, []);

    // Add summary row
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow([
      `Total Employees: ${employees.length}`,
    ]);
    summaryRow.font = { bold: true };
    worksheet.mergeCells(`A${summaryRow.number}:H${summaryRow.number}`);

    // Add borders
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 4 && rowNumber <= employees.length + 4) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    // Generate buffer
    return await workbook.xlsx.writeBuffer();
  },
};

module.exports = excelExporter;
