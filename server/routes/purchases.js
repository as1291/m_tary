// routes/purchases.js
const express  = require('express');
const mongoose = require('mongoose');
const auth     = require('../middleware/auth');

const router    = express.Router();
const Purchase  = mongoose.model('Purchase');

/*--------------------------------------------------------------------
 * Helper: scope non‑admin users to their own base
 *------------------------------------------------------------------*/
function baseScope(user) {
  return user.role === 'admin' ? {} : { base: user.base };
}

/*────────────────────  GET /api/purchases  ────────────────────────
 * List purchases.  Admin sees everything, others only their base.
 * Optional query params:
 *   ?base=<baseId>      (admin only)
 *   ?from=YYYY-MM-DD    (filter purchaseDate ≥)
 *   ?to=YYYY-MM-DD      (filter purchaseDate ≤)
 *------------------------------------------------------------------*/
router.get('/', auth(), async (req, res) => {
  try {
    const filter = baseScope(req.user);

    if (req.query.base && req.user.role === 'admin')
      filter.base = req.query.base;

    if (req.query.from || req.query.to) {
      filter.purchaseDate = {};
      if (req.query.from) filter.purchaseDate.$gte = req.query.from;
      if (req.query.to)   filter.purchaseDate.$lte = req.query.to;
    }

    const purchases = await Purchase.find(filter)
      .populate('base', 'name code')
      .populate('equipmentType', 'name category')
      .populate('createdBy', 'username');

    res.json(purchases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch purchases.' });
  }
});

/*─────────────────  GET /api/purchases/:id  ───────────────────────*/
router.get('/:id', auth(), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ message: 'Purchase not found.' });

    const purchase = await Purchase.findById(id)
      .populate('base', 'name code')
      .populate('equipmentType', 'name category')
      .populate('createdBy', 'username');

    if (!purchase)
      return res.status(404).json({ message: 'Purchase not found.' });

    if (req.user.role !== 'admin' && String(purchase.base._id) !== req.user.base)
      return res.status(403).json({ message: 'Forbidden: not your base.' });

    res.json(purchase);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving purchase.' });
  }
});

/*──────────────────  POST /api/purchases  ─────────────────────────
 * Create purchase.  Only admin & logistics_officer.
 *------------------------------------------------------------------*/
router.post('/', auth(['admin', 'logistics_officer']), async (req, res) => {
  try {
    const {
      base,                // required
      equipmentType,       // required
      quantity,            // required (int > 0)
      unitCost,
      totalCost,           // can be calculated client‑side or leave null
      supplier,
      purchaseDate,        // required
      purchaseOrderNumber,
      notes
    } = req.body;

    if (!base || !equipmentType || !quantity || !purchaseDate)
      return res.status(400).json({ message: 'Missing required fields.' });

    const purchase = await Purchase.create({
      base,
      equipmentType,
      quantity,
      unitCost,
      totalCost: totalCost ?? (unitCost ? (unitCost * quantity) : undefined),
      supplier,
      purchaseDate,
      purchaseOrderNumber,
      notes,
      createdBy: req.user.uid
    });

    res.status(201).json(purchase);
  } catch (err) {
    console.error(err);
    res.status(422).json({ message: 'Creation failed.', detail: err.message });
  }
});

/*────────────────  PATCH /api/purchases/:id  ──────────────────────
 * Update purchase.  Admin & logistics_officer.
 *------------------------------------------------------------------*/
router.patch('/:id', auth(['admin', 'logistics_officer']), async (req, res) => {
  try {
    // Disallow changing createdBy
    delete req.body.createdBy;

    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!purchase)
      return res.status(404).json({ message: 'Purchase not found.' });

    res.json(purchase);
  } catch (err) {
    console.error(err);
    res.status(422).json({ message: 'Update failed.', detail: err.message });
  }
});

/*────────────────  DELETE /api/purchases/:id  ─────────────────────
 * Hard delete restricted to admins only.
 *------------------------------------------------------------------*/
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const removed = await Purchase.findByIdAndDelete(req.params.id);
    if (!removed)
      return res.status(404).json({ message: 'Purchase not found.' });

    res.json({ message: 'Purchase deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Deletion error.' });
  }
});

module.exports = router;
