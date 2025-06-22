const mongoose = require("mongoose");
// models/Asset.js (example)
// const auditPlugin = require('../utils/auditPlugin');

const transferSchema = new mongoose.Schema({
  fromBase: { type: mongoose.Schema.Types.ObjectId, ref: "Base" },
  toBase: { type: mongoose.Schema.Types.ObjectId, ref: "Base" },
  equipmentType: { type: mongoose.Schema.Types.ObjectId, ref: "EquipmentType" },
  quantity: { type: Number, required: true, min: 1 },
  transferDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "in_transit", "completed", "cancelled"],
    default: "pending",
  },
  notes: String,
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
// transferSchema.plugin(auditPlugin);

module.exports = mongoose.model("Transfer", transferSchema);
