/**
 * server/index.js
 * Central application bootstrap
 */
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ───────────────────── 1. GLOBAL MIDDLEWARE ───────────────────── */
app.use(express.json({ limit: "10mb" })); // larger body limit for file uploads if needed

// Configure CORS to handle credentials properly
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173', // Vite dev server default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

/* ───────────────────── 2. MODEL BOOTSTRAP ───────────────────────
   Ensures every file in /models is required once so Mongoose
   registers the schema before any route handlers run.          */
fs.readdirSync(path.join(__dirname, "models"))
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => require(`./models/${file}`));

/* ───────────────────── 3. ROUTES ────────────────────────────────
   Only two routes wired today.  Add more as the API grows.      */
app.use("/api/assets", require("./routes/assets"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/bases", require("./routes/bases"));
app.use("/api/equipmentTypes", require("./routes/equipmentTypes"));
app.use("/api/purchases", require("./routes/purchases"));
app.use("/api/transfers", require("./routes/transfers"));
app.use("/api/assignments", require("./routes/assignments"));
app.use('/api/expenditures', require('./routes/expenditures'));
app.use('/api/auditLogs', require('./routes/auditLogs'));


// …and so on.

/* ───────────────────── 4. DATABASE & SERVER START ─────────────── */
mongoose.set("strictQuery", true); // optional; keeps queries explicit

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true, // ← typo fixed from userNewurlParser
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected");

    app.listen(PORT, () =>
      console.log(`Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // halt the process on failure
  }
})();

/* ───────────────────── 5. OPTIONAL PROCESS SAFETY NETS ───────────
process.on('unhandledRejection', err => { … });
process.on('uncaughtException',  err => { … });
*/
