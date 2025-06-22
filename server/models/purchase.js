const mongoose = require("mongoose");
// models/Asset.js (example)
// const auditPlugin = require("../utils/auditPlugin");

const purchaseSchema = new mongoose.Schema({
  base: { type: mongoose.Schema.Types.ObjectId, ref: "Base" },
  equipmentType: { type: mongoose.Schema.Types.ObjectId, ref: "EquipmentType" },
  quantity: { type: Number, required: true, min: 1 },
  unitCost: Number,
  totalCost: Number,
  supplier: String,
  purchaseDate: { type: Date, required: true },
  purchaseOrderNumber: String,
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});
// purchaseSchema.plugin(auditPlugin);

module.exports = mongoose.model("Purchase", purchaseSchema);
