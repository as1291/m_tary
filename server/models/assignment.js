const mongoose = require("mongoose");
// models/Asset.js (example)
// const auditPlugin = require('../utils/auditPlugin');


const assignmentSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
  assignedTo: { type: String, required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignmentDate: { type: Date, required: true },
  expectedReturnDate: Date,
  actualReturnDate: Date,
  status: {
    type: String,
    enum: ["active", "returned", "lost", "damaged"],
    default: "active",
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
// assignmentSchema.plugin(auditPlugin);
module.exports = mongoose.model("Assignment", assignmentSchema);
