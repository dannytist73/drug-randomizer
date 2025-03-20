const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  id: String,
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  employeeId: String,
  department: String,
  position: String,
  email: String,
  phone: String,
  joinDate: Date,
});

module.exports = mongoose.model("Employee", employeeSchema);
