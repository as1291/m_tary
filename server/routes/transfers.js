// routes/transfers.js
const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

const router = express.Router();
const Transfer = mongoose.model("Transfer");

/*--------------------------------------------------------------------
 * Helper: build an access‑filter so non‑admin users only see transfers
 * that involve their own base (either sender or receiver).
 *------------------------------------------------------------------*/
function buildBaseScope(user) {
  return user.role === "admin"
    ? {} // admins see everything
    : { $or: [{ fromBase: user.base }, { toBase: user.base }] };
}

/*──────────────────────  GET /api/transfers  ──────────────────────*/
router.get("/", auth(), async (req, res) => {
  try {
    const filter = buildBaseScope(req.user);

    // Optional ?status=pending query param
    if (req.query.status) filter.status = req.query.status;

    const transfers = await Transfer.find(filter)
      .populate("fromBase toBase", "name code")
      .populate("equipmentType", "name category")
      .populate("initiatedBy approvedBy", "username");

    res.json(transfers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch transfers." });
  }
});

/*───────────────────  GET /api/transfers/:id  ─────────────────────*/
router.get("/:id", auth(), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ message: "Transfer not found." });

    const transfer = await Transfer.findById(id)
      .populate("fromBase toBase", "name code")
      .populate("equipmentType", "name category")
      .populate("initiatedBy approvedBy", "username");

    if (!transfer)
      return res.status(404).json({ message: "Transfer not found." });

    // non‑admins: must involve their base
    if (
      req.user.role !== "admin" &&
      ![String(transfer.fromBase?._id), String(transfer.toBase?._id)].includes(
        req.user.base
      )
    ) {
      return res.status(403).json({ message: "Forbidden: not your base." });
    }

    res.json(transfer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving transfer." });
  }
});

/*───────────────────  POST /api/transfers  ────────────────────────
 * Anyone with role admin or logistics_officer can initiate.
 * The route sets `initiatedBy` automatically from JWT.
 *------------------------------------------------------------------*/
router.post("/", auth(["admin", "logistics_officer"]), async (req, res) => {
  try {
    const { fromBase, toBase, equipmentType, quantity, transferDate, notes } =
      req.body;

    if (!fromBase || !toBase || !equipmentType || !quantity || !transferDate)
      return res.status(400).json({ message: "Missing required fields." });

    if (fromBase === toBase)
      return res
        .status(400)
        .json({ message: "fromBase and toBase must differ." });

    const transfer = await Transfer.create({
      fromBase,
      toBase,
      equipmentType,
      quantity,
      transferDate,
      status: "pending",
      notes,
      initiatedBy: req.user.uid,
    });

    res.status(201).json(transfer);
  } catch (err) {
    console.error(err);
    res
      .status(422)
      .json({ message: "Transfer creation failed.", detail: err.message });
  }
});

/*─────────────────  PATCH /api/transfers/:id  ─────────────────────
 * Update allowed for admin & logistics_officer.
 * Typical use: change status (pending → in_transit → completed/cancelled),
 * add notes, or assign approvedBy.
 *------------------------------------------------------------------*/
router.patch("/:id", auth(["admin", "logistics_officer"]), async (req, res) => {
  try {
    // prevent clients from overwriting core fields we set server‑side
    delete req.body.initiatedBy;

    const transfer = await Transfer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!transfer)
      return res.status(404).json({ message: "Transfer not found." });

    res.json(transfer);
  } catch (err) {
    console.error(err);
    res.status(422).json({ message: "Update failed.", detail: err.message });
  }
});

/*───────────────  DELETE /api/transfers/:id  ──────────────────────
 * Hard delete restricted to admins only. Consider soft‑deleting
 * (e.g. `status:"cancelled"`) in a real production system.
 *------------------------------------------------------------------*/
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const removed = await Transfer.findByIdAndDelete(req.params.id);
    if (!removed)
      return res.status(404).json({ message: "Transfer not found." });

    res.json({ message: "Transfer deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Deletion error." });
  }
});

module.exports = router;
