const express  = require('express');
const mongoose = require('mongoose');
const auth     = require('../middleware/auth');

const router          = express.Router();
const EquipmentType   = mongoose.model('EquipmentType');

/* ─────────  GET /api/equipmentTypes  ─────────
 *  Everyone with a valid token can list equipment.
 *  Optional ?category=vehicles filter.               */
router.get('/', auth(), async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const equipment = await EquipmentType.find(filter);
    res.json(equipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch equipment types.' });
  }
});

/* ─────────  GET /api/equipmentTypes/:id  ───────── */
router.get('/:id', auth(), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ message: 'Equipment type not found.' });

    const equipment = await EquipmentType.findById(id);
    if (!equipment)
      return res.status(404).json({ message: 'Equipment type not found.' });

    res.json(equipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving equipment type.' });
  }
});

/* ─────────  POST /api/equipmentTypes  ─────────
 *  Only admin & logistics_officer can create.         */
router.post('/', auth(['admin', 'logistics_officer']), async (req, res) => {
  try {
    const { name, category, specifications } = req.body;

    if (!name || !category)
      return res.status(400).json({ message: '`name` and `category` are required.' });

    // Prevent duplicate names
    if (await EquipmentType.findOne({ name }))
      return res.status(409).json({ message: 'Equipment type already exists.' });

    const equipment = await EquipmentType.create({ name, category, specifications });
    res.status(201).json(equipment);
  } catch (err) {
    console.error(err);
    res.status(422).json({ message: 'Creation failed.', detail: err.message });
  }
});

/* ─────────  PATCH /api/equipmentTypes/:id  ─────────
 *  Update allowed for admin & logistics_officer.      */
router.patch('/:id', auth(['admin', 'logistics_officer']), async (req, res) => {
  try {
    const updates = req.body;
    const options = { new: true, runValidators: true };

    const equipment = await EquipmentType.findByIdAndUpdate(req.params.id, updates, options);
    if (!equipment)
      return res.status(404).json({ message: 'Equipment type not found.' });

    res.json(equipment);
  } catch (err) {
    console.error(err);
    res.status(422).json({ message: 'Update failed.', detail: err.message });
  }
});

/* ─────────  DELETE /api/equipmentTypes/:id  ─────────
 *  Deletion restricted to admin only.                 */
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const removed = await EquipmentType.findByIdAndDelete(req.params.id);
    if (!removed)
      return res.status(404).json({ message: 'Equipment type not found.' });

    res.json({ message: 'Equipment type deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Deletion error.' });
  }
});

module.exports = router;
