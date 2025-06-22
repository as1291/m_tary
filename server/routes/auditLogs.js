const express  = require('express');
const mongoose = require('mongoose');
const auth     = require('../middleware/auth');

const router    = express.Router();
const AuditLog  = mongoose.model('AuditLog');

/*──────────── Helper: build dynamic filter from query params ──────────*/
function buildFilter(q) {
  const filter = {};
  if (q.table)       filter.tableName = q.table;
  if (q.action)      filter.action = q.action;          // INSERT | UPDATE | DELETE
  if (q.user)        filter.user = q.user;              // user id
  if (q.record)      filter.recordId = q.record;        // affected record id
  if (q.from || q.to) {
    filter.timestamp = {};
    if (q.from) filter.timestamp.$gte = new Date(q.from);
    if (q.to)   filter.timestamp.$lte = new Date(q.to);
  }
  return filter;
}

/*──────────────── GET /api/auditLogs ─────────────────────────
 * Admin‑only. Supports filters & pagination:
 *   ?table=bases
 *   ?action=UPDATE
 *   ?user=<userId>
 *   ?record=<uuid>
 *   ?from=2025-06-01&to=2025-06-20
 *   ?page=2&limit=50
 *─────────────────────────────────────────────────────────────*/
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '25', 10), 1), 100);

    const filter = buildFilter(req.query);
    const total  = await AuditLog.countDocuments(filter);
    const logs   = await AuditLog.find(filter)
                      .sort({ timestamp: -1 })
                      .skip((page - 1) * limit)
                      .limit(limit)
                      .populate('user', 'username role')   // show who did it
                      .lean();

    res.json({ total, page, limit, logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch audit logs.' });
  }
});

/*──────────────── GET /api/auditLogs/:id ─────────────────────*/
router.get('/:id', auth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ message: 'Audit log not found.' });

    const log = await AuditLog.findById(id)
                  .populate('user', 'username role')
                  .lean();

    if (!log) return res.status(404).json({ message: 'Audit log not found.' });
    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving audit log.' });
  }
});

/*──────────────── LOCK DOWN write operations ─────────────────
 * Even admins shouldn’t create/modify logs through the API;
 * they should be written automatically by your business logic.
 * Attempting POST/PATCH/DELETE returns 405 Method Not Allowed.
 *─────────────────────────────────────────────────────────────*/
['post', 'patch', 'delete', 'put'].forEach(m =>
  router[m]('/',            (_, res) => res.sendStatus(405))
);
['patch', 'delete', 'put'].forEach(m =>
  router[m]('/:id',         (_, res) => res.sendStatus(405))
);

module.exports = router;
