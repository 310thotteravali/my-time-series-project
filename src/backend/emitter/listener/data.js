const mongoose = require("mongoose");

// Define a schema for your data
const dataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  secret_key: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create a model based on the schema
const DataModel = mongoose.model("Data", dataSchema);

module.exports = DataModel;
