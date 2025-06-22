// server/utils/auditPlugin.js
const mongoose = require("mongoose");

module.exports = function auditPlugin(schema) {
  /* ── helper to insert one log ── */
  async function addLog(ctx, action, oldDoc, newDoc) {
    const AuditLog = mongoose.model("AuditLog");

    // ctx.options._audit carries user/ip/ua pushed from the controller
    const meta = ctx.options._audit || {};

    await AuditLog.create({
      tableName: schema.options.collection || schema.modelName, // e.g. 'assets'
      recordId: oldDoc?._id || newDoc?._id, // doc id
      action, // INSERT / UPDATE / DELETE
      oldValues: oldDoc,
      newValues: newDoc,
      user: meta.userId, // can be undefined
      ipAddress: meta.ip,
      userAgent: meta.ua,
    });
  }

  /* INSERT (save on new docs) */
  schema.post("save", async function (doc, next) {
    if (doc.wasNew) {
      await addLog(this, "INSERT", null, doc);
    }
    next();
  });

  /* UPDATE (updateOne & findOneAndUpdate) */
  schema.pre(["updateOne", "findOneAndUpdate"], async function () {
    const oldDoc = await this.model.findOne(this.getQuery()).lean();
    this._oldDocForAudit = oldDoc;
  });

  schema.post(["updateOne", "findOneAndUpdate"], async function (res, next) {
    const newDoc = await this.model.findOne(this.getQuery()).lean();
    await addLog(this, "UPDATE", this._oldDocForAudit, newDoc);
    next();
  });

  /* DELETE (deleteOne & findOneAndDelete) */
  schema.pre(["deleteOne", "findOneAndDelete"], async function () {
    const oldDoc = await this.model.findOne(this.getQuery()).lean();
    this._oldDocForAudit = oldDoc;
  });

  schema.post(["deleteOne", "findOneAndDelete"], async function (res, next) {
    await addLog(this, "DELETE", this._oldDocForAudit, null);
    next();
  });

  /* mark new docs so post('save') knows it's an INSERT */
  schema.pre("save", function (next) {
    this.wasNew = this.isNew;
    next();
  });
};
