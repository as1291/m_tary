const mongoose = require("mongoose");
// models/Asset.js (example)
// const auditPlugin = require("../utils/auditPlugin");

const expenditureSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
  base: { type: mongoose.Schema.Types.ObjectId, ref: "Base" },
  equipmentType: { type: mongoose.Schema.Types.ObjectId, ref: "EquipmentType" },
  quantity: { type: Number, required: true, min: 1 },
  expenditureDate: { type: Date, required: true },
  reason: { type: String, required: true },
  authorizedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: String,
  createdAt: { type: Date, default: Date.now },
});
// expenditureSchema.plugin(auditPlugin);
module.exports = mongoose.model("Expenditure", expenditureSchema);
