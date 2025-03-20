/**
 * Application configuration settings
 */
const config = {
  // Application name
  appName: "Drug Test Randomizer",

  // Philippine authority contact information
  authorities: {
    pdea: {
      name: "Philippine Drug Enforcement Agency (PDEA)",
      website: "https://pdea.gov.ph/",
      hotline: "#PDEA or 09998887332",
      email: "pdea.ippd@pdea.gov.ph",
    },
    ddb: {
      name: "Dangerous Drugs Board (DDB)",
      website: "https://www.ddb.gov.ph/",
      hotline: "1365",
      email: "communications@ddb.gov.ph",
    },
    doh: {
      name: "Department of Health (DOH)",
      website: "https://doh.gov.ph/",
      hotline: "1555",
      email: "callcenter@doh.gov.ph",
    },
    pnp: {
      name: "Philippine National Police (PNP)",
      website: "https://pnp.gov.ph/",
      hotline: "117 or 911",
      email: "pnpo.adm@gmail.com",
    },
  },

  // Randomization settings
  randomization: {
    // Minimum percentage of employees to randomize per year
    minPercentage: 10,

    // Maximum percentage of employees to randomize per year
    maxPercentage: 50,

    // Default number of employees to randomize at once
    defaultCount: 10,
  },

  // CSV file expected headers (lowercased and normalized)
  csvHeaders: {
    required: ["first_name", "last_name"],
    optional: [
      "id",
      "employee_id",
      "department",
      "position",
      "email",
      "phone",
      "join_date",
    ],
  },
};

module.exports = config;
