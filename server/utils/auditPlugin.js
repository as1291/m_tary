// // server/utils/auditPlugin.js
// const mongoose = require("mongoose");

// module.exports = function auditPlugin(schema) {
//   /* ── helper to insert one log ── */
//   async function addLog(ctx, action, oldDoc, newDoc) {
//     const AuditLog = mongoose.model("AuditLog");

//     // ctx.options._audit carries user/ip/ua pushed from the controller
//     const meta = ctx.options._audit || {};

//     await AuditLog.create({
//       tableName: schema.options.collection || schema.modelName, // e.g. 'assets'
//       recordId: oldDoc?._id || newDoc?._id, // doc id
//       action, // INSERT / UPDATE / DELETE
//       oldValues: oldDoc,
//       newValues: newDoc,
//       user: meta.userId, // can be undefined
//       ipAddress: meta.ip,
//       userAgent: meta.ua,
//     });
//   }

//   /* INSERT (save on new docs) */
//   schema.post("save", async function (doc, next) {
//     if (doc.wasNew) {
//       await addLog(this, "INSERT", null, doc);
//     }
//     next();
//   });

//   /* UPDATE (updateOne & findOneAndUpdate) */
//   schema.pre(["updateOne", "findOneAndUpdate"], async function () {
//     const oldDoc = await this.model.findOne(this.getQuery()).lean();
//     this._oldDocForAudit = oldDoc;
//   });

//   schema.post(["updateOne", "findOneAndUpdate"], async function (res, next) {
//     const newDoc = await this.model.findOne(this.getQuery()).lean();
//     await addLog(this, "UPDATE", this._oldDocForAudit, newDoc);
//     next();
//   });

//   /* DELETE (deleteOne & findOneAndDelete) */
//   schema.pre(["deleteOne", "findOneAndDelete"], async function () {
//     const oldDoc = await this.model.findOne(this.getQuery()).lean();
//     this._oldDocForAudit = oldDoc;
//   });

//   schema.post(["deleteOne", "findOneAndDelete"], async function (res, next) {
//     await addLog(this, "DELETE", this._oldDocForAudit, null);
//     next();
//   });

//   /* mark new docs so post('save') knows it's an INSERT */
//   schema.pre("save", function (next) {
//     this.wasNew = this.isNew;
//     next();
//   });
// };


const AuditLog = require('../models/auditLog');

const addLog = async (doc, action, options = {}) => {
  try {
    // Check if options and _audit exist
    if (!options || !options._audit) {
      console.warn('Audit options not provided, skipping audit log');
      return;
    }

    const { userId, ip, ua } = options._audit;
    
    await AuditLog.create({
      model: doc.constructor.modelName,
      documentId: doc._id,
      action,
      userId,
      ip,
      userAgent: ua,
      changes: doc.toObject(),
    });
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw the error to prevent breaking the main operation
  }
};

const auditPlugin = (schema) => {
  schema.post('save', async function(doc, next) {
    try {
      const options = this.$__.saveOptions || {};
      await addLog(doc, this.isNew ? 'create' : 'update', options);
    } catch (error) {
      console.error('Post save audit error:', error);
    }
    next();
  });

  schema.post('findOneAndUpdate', async function(doc, next) {
    try {
      if (doc) {
        const options = this.getOptions() || {};
        await addLog(doc, 'update', options);
      }
    } catch (error) {
      console.error('Post update audit error:', error);
    }
    next();
  });

  schema.post('findOneAndDelete', async function(doc, next) {
    try {
      if (doc) {
        const options = this.getOptions() || {};
        await addLog(doc, 'delete', options);
      }
    } catch (error) {
      console.error('Post delete audit error:', error);
    }
    next();
  });
};

module.exports = auditPlugin;
