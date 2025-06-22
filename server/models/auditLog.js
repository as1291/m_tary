const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  tableName: { type: String, required: true },
  recordId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, enum: ["INSERT", "UPDATE", "DELETE"] },
  oldValues: mongoose.Schema.Types.Mixed,
  newValues: mongoose.Schema.Types.Mixed,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
