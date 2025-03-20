const mongoose = require("mongoose");

const randomizedEmployeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  name: String,
  department: String,
  position: String,
  randomizedDate: {
    type: Date,
    default: Date.now,
  },
  year: Number,
});

module.exports = mongoose.model("RandomizedEmployee", randomizedEmployeeSchema);
