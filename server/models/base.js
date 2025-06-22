const mongoose = require("mongoose");
// models/Asset.js (example)
// const auditPlugin = require('../utils/auditPlugin');


const baseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  location: String,
  commander: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
// baseSchema.plugin(auditPlugin);
module.exports = mongoose.model("Base", baseSchema);
