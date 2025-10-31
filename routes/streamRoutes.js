import express from "express";
import Stream from "../model/Stream.js"; // create this model (below)

const router = express.Router();

/**
 * POST /api/streams
 * Save stream name permanently (idempotent)
 */
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Stream name is required" });
    }

    const normalized = name.trim().toLowerCase();

    // Check if already exists
    let stream = await Stream.findOne({ name: normalized });
    if (!stream) {
      stream = new Stream({ name: normalized, originalName: name.trim() });
      await stream.save();
    }

    return res.status(200).json({ message: "Stream saved successfully", stream });
  } catch (error) {
    console.error("Error saving stream:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/streams?q=<text>
 * Fetch stream suggestions (for auto-suggest dropdown)
 */
router.get("/", async (req, res) => {
  try {
    const q = req.query.q?.trim() || "";
    const filter = q
      ? { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
      : {};

    const streams = await Stream.find(filter).sort({ createdAt: -1 }).limit(20).lean();
    res.status(200).json(streams.map((s) => s.originalName));
  } catch (error) {
    console.error("Error fetching streams:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
