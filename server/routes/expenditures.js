const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

const router = express.Router();
const Expenditure = mongoose.model("Expenditure");

/*──────────────── Helper: scope to caller’s base ───────────────*/
const scopeForUser = (user) =>
  user.role === "admin" ? {} : { base: user.base };

/*──────────────── GET /api/expenditures ────────────────────────
 * Admin → all.  Others → only their base.
 * Optional query params:
 *   ?from=YYYY-MM-DD
 *   ?to=YYYY-MM-DD
 *   ?reason=maintenance
 *───────────────────────────────────────────────────────────────*/
router.get("/", auth(), async (req, res) => {
  try {
    const filter = scopeForUser(req.user);

    /* date range filter */
    if (req.query.from || req.query.to) {
      filter.expenditureDate = {};
      if (req.query.from) filter.expenditureDate.$gte = req.query.from;
      if (req.query.to) filter.expenditureDate.$lte = req.query.to;
    }

    /* reason filter */
    if (req.query.reason) filter.reason = req.query.reason;

    const expenditures = await Expenditure.find(filter)
      .populate("asset", "serialNumber")
      .populate("equipmentType", "name category")
      .populate("base", "name code")
      .populate("authorizedBy", "username");

    res.json(expenditures);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch expenditures." });
  }
});

/*──────────────── GET /api/expenditures/:id ────────────────────*/
router.get("/:id", auth(), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ message: "Expenditure not found." });

    const exp = await Expenditure.findById(id)
      .populate("asset", "serialNumber")
      .populate("equipmentType", "name category")
      .populate("base", "name code")
      .populate("authorizedBy", "username");

    if (!exp)
      return res.status(404).json({ message: "Expenditure not found." });

    if (req.user.role !== "admin" && String(exp.base._id) !== req.user.base)
      return res.status(403).json({ message: "Forbidden: not your base." });

    res.json(exp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving expenditure." });
  }
});

/*──────────────── POST /api/expenditures ───────────────────────
 * Roles: admin & logistics_officer
 *───────────────────────────────────────────────────────────────*/
router.post("/", auth(["admin", "logistics_officer"]), async (req, res) => {
  try {
    const {
      asset,
      base,
      equipmentType,
      quantity,
      expenditureDate,
      reason,
      notes,
    } = req.body;

    if (
      !asset ||
      !base ||
      !equipmentType ||
      !quantity ||
      !expenditureDate ||
      !reason
    )
      return res.status(400).json({ message: "Missing required fields." });

    const exp = await Expenditure.create({
      asset,
      base,
      equipmentType,
      quantity,
      expenditureDate,
      reason,
      notes,
      authorizedBy: req.user.uid,
    });

    res.status(201).json(exp);
  } catch (err) {
    console.error(err);
    res.status(422).json({ message: "Creation failed.", detail: err.message });
  }
});

/*──────────────── PATCH /api/expenditures/:id ──────────────────
 * Roles: admin & logistics_officer
 *───────────────────────────────────────────────────────────────*/
router.patch("/:id", auth(["admin", "logistics_officer"]), async (req, res) => {
  try {
    delete req.body.authorizedBy; // can’t overwrite

    const exp = await Expenditure.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!exp)
      return res.status(404).json({ message: "Expenditure not found." });
    res.json(exp);
  } catch (err) {
    console.error(err);
    res.status(422).json({ message: "Update failed.", detail: err.message });
  }
});

/*──────────────── DELETE /api/expenditures/:id ────────────────
 * Role: admin only
 *───────────────────────────────────────────────────────────────*/
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const removed = await Expenditure.findByIdAndDelete(req.params.id);
    if (!removed)
      return res.status(404).json({ message: "Expenditure not found." });

    res.json({ message: "Expenditure deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Deletion error." });
  }
});

module.exports = router;
