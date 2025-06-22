// routes/bases.js
const express  = require('express');
const mongoose = require('mongoose');
const auth     = require('../middleware/auth');

const router = express.Router();
const Base   = mongoose.model('Base');
const User   = mongoose.model('User');

/* ─────────  GET /api/bases  ───────── */
router.get('/', auth(), async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : { _id: req.user.base };          // non‑admins: only their base

    const bases = await Base.find(filter)
      .populate('commander', 'username email role');

    res.json(bases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch bases.' });
  }
});

/* ─────────  GET /api/bases/:id  ───────── */
router.get('/:id', auth(), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ message: 'Base not found.' });

    const base = await Base.findById(id)
      .populate('commander', 'username email role');

    if (!base) return res.status(404).json({ message: 'Base not found.' });

    if (req.user.role !== 'admin' && String(base._id) !== req.user.base)
      return res.status(403).json({ message: 'Forbidden: not your base.' });

    res.json(base);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving base.' });
  }
});

/* ─────────  POST /api/bases  ───────── */
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { name, code, location, commander } = req.body;

    // Optional: verify commander exists & has correct role
    if (commander) {
      const commanderUser = await User.findById(commander);
      if (!commanderUser || commanderUser.role !== 'base_commander')
        return res.status(400).json({ message: 'Invalid commander id or role.' });
    }

    const base = await Base.create({ name, code, location, commander });
    res.status(201).json(base);
  } catch (err) {
    console.error(err);
    res.status(422).json({ message: 'Base creation failed.', detail: err.message });
  }
});

/* ─────────  PATCH /api/bases/:id  ───────── */
router.patch('/:id', auth(['admin']), async (req, res) => {
  try {
    const updates = req.body;

    // If commander is being changed, validate user & role
    if (updates.commander) {
      const cmd = await User.findById(updates.commander);
      if (!cmd || cmd.role !== 'base_commander')
        return res.status(400).json({ message: 'Invalid commander id or role.' });
    }

    const base = await Base.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!base) return res.status(404).json({ message: 'Base not found.' });
    res.json(base);
  } catch (err) {
    console.error(err);
    res.status(422).json({ message: 'Update failed.', detail: err.message });
  }
});

/* ─────────  DELETE /api/bases/:id  ───────── */
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const removed = await Base.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Base not found.' });
    res.json({ message: 'Base deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Deletion error.' });
  }
});

module.exports = router;
