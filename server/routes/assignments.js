const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

const router = express.Router();
const Assignment = mongoose.model("Assignment");
const Asset = mongoose.model("Asset");

/* ---------------------------------------------------------------
 * Helper: restrict non‑admin users to assignments at their base
 * ------------------------------------------------------------- */
function buildScope(user) {
  return user.role === "admin" ? {} : { base: user.base }; // used after we join asset.base
}

/* ───────────────── GET /api/assignments ───────────────────────
 * Lists assignments.
 *  • admin  – sees all
 *  • others – only assignments where asset.base == user.base     */
router.get('/', auth(), async (req, res) => {
  try {
    const pipeline = [
      /* join assets */
      { $lookup: {
          from: 'assets',
          localField: 'asset',
          foreignField: '_id',
          as: 'asset'
      }},
      { $unwind: '$asset' },

      /* join bases → put result in top‑level "base" */
      { $lookup: {
          from: 'bases',
          localField: 'asset.base',
          foreignField: '_id',
          as: 'base'
      }},
      { $unwind: '$base' }
    ];

    /* restrict non‑admins to their own base */
    if (req.user.role !== 'admin') {
      pipeline.push({
        $match: { 'base._id': new mongoose.Types.ObjectId(req.user.base) }
      });
    }

    const assignments = await Assignment.aggregate(pipeline);
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch assignments.' });
  }
});


/* ───────────────── GET /api/assignments/:id ─────────────────── */
router.get("/:id", auth(), async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ message: "Assignment not found." });

    const assignment = await Assignment.findById(id)
      .populate({
        path: "asset",
        populate: { path: "base", select: "name code" },
      })
      .populate("assignedBy", "username");

    if (!assignment)
      return res.status(404).json({ message: "Assignment not found." });

    if (
      req.user.role !== "admin" &&
      String(assignment.asset.base._id) !== req.user.base
    )
      return res.status(403).json({ message: "Forbidden: not your base." });

    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving assignment." });
  }
});

/* ───────────────── POST /api/assignments ──────────────────────
 * Create assignment.  Roles: admin, logistics_officer            */
router.post("/", auth(["admin", "logistics_officer"]), async (req, res) => {
  try {
    const { asset, assignedTo, assignmentDate, expectedReturnDate, notes } =
      req.body;

    // Basic validation
    if (!asset || !assignedTo || !assignmentDate)
      return res.status(400).json({ message: "Missing required fields." });

    // Check asset exists & belongs to caller’s base (unless admin)
    const assetDoc = await Asset.findById(asset).populate("base");
    if (!assetDoc)
      return res.status(400).json({ message: "Invalid asset ID." });

    if (
      req.user.role !== "admin" &&
      String(assetDoc.base._id) !== req.user.base
    )
      return res.status(403).json({ message: "Asset not at your base." });

    const assignment = await Assignment.create({
      asset,
      assignedTo,
      assignedBy: req.user.uid,
      assignmentDate,
      expectedReturnDate,
      status: "active",
      notes,
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    res
      .status(422)
      .json({ message: "Assignment creation failed.", detail: err.message });
  }
});

/* ───────────────── PATCH /api/assignments/:id ─────────────────
 * Update assignment (status, return dates, notes).              */
router.patch("/:id", auth(["admin", "logistics_officer"]), async (req, res) => {
  try {
    // Prevent clients from overwriting assignedBy
    delete req.body.assignedBy;

    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!assignment)
      return res.status(404).json({ message: "Assignment not found." });

    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(422).json({ message: "Update failed.", detail: err.message });
  }
});

/* ───────────────── DELETE /api/assignments/:id ────────────────
 * Hard delete restricted to admin                               */
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const removed = await Assignment.findByIdAndDelete(req.params.id);
    if (!removed)
      return res.status(404).json({ message: "Assignment not found." });

    res.json({ message: "Assignment deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Deletion error." });
  }
});

module.exports = router;
