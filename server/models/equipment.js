const mongoose = require("mongoose");
// models/Asset.js (example)
// const auditPlugin = require("../utils/auditPlugin");
const equipmentTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  specifications: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});
// equipmentTypeSchema.plugin(auditPlugin);
module.exports = mongoose.model("EquipmentType", equipmentTypeSchema);
