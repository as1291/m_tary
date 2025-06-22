// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const router = express.Router();

const User = mongoose.model("User"); // registered by the model loader
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret";

/* ─────────  POST /api/auth/register  ───────── */
const allowedRoles = ["admin", "base_commander", "logistics_officer"];

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role, base } = req.body;

    // Check for duplicates
    if (await User.findOne({ $or: [{ username }, { email }] }))
      return res
        .status(409)
        .json({ message: "Username or e-mail already taken." });

    // Validate role
    if (!allowedRoles.includes(role))
      return res.status(400).json({ message: `Invalid role: ${role}` });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash,
      role,
      base: role === "admin" ? null : base, // Admins have no base
    });

    res.status(201).json({
      id: user._id,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed." });
  }
});

/* ─────────  POST /api/auth/login  ───────── */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: "Invalid credentials." });

    // create a JWT valid for 12 h (adjust as needed)
    const token = jwt.sign(
      { uid: user._id, role: user.role, base: user.base },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed." });
  }
});

module.exports = router;
