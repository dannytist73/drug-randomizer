# Drug Test Randomizer

A comprehensive web application for managing employee drug testing in a fair, transparent, and randomized manner, while providing educational resources about drug awareness and prevention.

## Overview

This application helps organizations implement and manage drug testing programs by providing tools for employee data management, randomized selection, and reporting. The system also includes educational components about drug awareness, prevention resources, and contact information for relevant authorities.

## Features

### Admin Features

- **Secure Authentication**: Admin login system to protect sensitive operations
- **Employee Management**: Import employee data from CSV files
- **Randomization Tool**: Fairly select employees for drug testing based on configurable settings
- **Randomization History**: Track previously randomized employees to ensure fair distribution
- **Export Functionality**: Generate Excel reports of randomized employees and testing schedules
- **Dashboard**: View statistics and program status at a glance

### Public Features

- **Drug Awareness Resources**: Educational content about drug abuse prevention and recognition
- **Authority Contact Information**: Easy access to relevant agencies and hotlines
- **Blog Articles**: In-depth information about drug-related topics and workplace policies
- **Rehabilitation Resources**: Information about available treatment centers

## Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: EJS templates with Tailwind CSS
- **Data Storage**: JSON-based file storage
- **Authentication**: Session-based authentication
- **File Processing**: CSV and Excel file handling

## Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Setup Steps

1. Clone the repository:

   ```
   git clone https://github.com/dannytist73/drug-randomizer.git
   cd drug-test-randomizer
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=3000
   SESSION_SECRET=your_secure_session_secret
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   NODE_ENV=development
   ```

4. Start the application:

   ```
   npm start
   ```

   For development with auto-reload:

   ```
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## Project Structure

```
drug-test-randomizer/
├── app.js                 # Main application entry point
├── config.js              # Configuration settings
├── controllers/           # Route controllers
│   ├── adminController.js
│   ├── homeController.js
│   ├── randomizeController.js
│   └── resourcesController.js
├── data/                  # Data storage directory
│   ├── employees.json
│   └── randomized_employees.json
├── ensure-data-dir.js     # Data directory initialization
├── middleware/            # Express middleware
│   └── authMiddleware.js
├── models/                # Data models
│   ├── Employee.js
│   └── RandomizedEmployee.js
├── public/                # Static assets
│   ├── css/
│   ├── images/
│   └── js/
├── routes/                # Route definitions
│   ├── adminRoutes.js
│   ├── homeRoutes.js
│   └── index.js
├── services/              # Business logic services
│   ├── csvService.js
│   ├── randomizeService.js
│   └── excelExporter.js
├── utils/                 # Utility functions
│   └── validator.js
└── views/                 # EJS templates
    ├── admin/
    ├── errors/
    ├── home/
    ├── layouts/
    └── partials/
```

## Using the Application

### Admin Functions

1. **Login**: Access the admin area at `/admin/login` with your credentials
2. **Upload Employee Data**: Import a CSV file with employee information
3. **Randomize Selection**: Configure and run the randomization process
4. **View Results**: See the list of selected employees
5. **Export Reports**: Generate Excel reports of randomized employees

### CSV Format

The system expects CSV files with the following columns (column names are not case-sensitive):

- `First Name` or `FirstName` (required)
- `Last Name` or `LastName` (required)
- `ID` or `Employee ID` (at least one is required)
- `Department` (optional)
- `Position` or `Job Title` (optional)
- `Email` (optional)
- `Phone` or `Phone Number` (optional)
- `Join Date` or `Hire Date` (optional)

### Randomization Options

The system offers two randomization methods:

1. **Simple Random**: Selects employees completely at random
2. **Stratified Random**: Selects employees from each department proportionally

## Customization

### Modifying the Application Name

Edit the `appName` property in `config.js` to change the application name.

### Updating Authority Contact Information

Edit the `authorities` object in `config.js` to update contact information for relevant authorities.

### Adjusting Randomization Settings

Modify the `randomization` object in `config.js` to change default randomization settings.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please contact [dannytist.73@gmail.com](mailto:dannytist.73@gmail.com).
