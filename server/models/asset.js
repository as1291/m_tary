const mongoose = require("mongoose");
const auditPlugin = require("../utils/auditPlugin");

// models/Asset.js (example)
const assetSchema = new mongoose.Schema(
  {
    serialNumber: { type: String, required: true, unique: true },
    equipmentType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EquipmentType",
    },
    base: { type: mongoose.Schema.Types.ObjectId, ref: "Base" },
    status: {
      type: String,
      enum: ["available", "assigned", "expended", "maintenance"],
      default: "available",
    },
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      default: "good",
    },
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "assets", // ✅ ensures plugin sees a name
  }
);
assetSchema.plugin(auditPlugin);
module.exports = mongoose.model("Asset", assetSchema);
