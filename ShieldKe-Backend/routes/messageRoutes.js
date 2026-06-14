const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");

/* GET MESSAGES */
router.get("/:consultationId", protect, async (req, res) => {

  try {

    const messages = await Message.find({
      consultation: req.params.consultationId
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

});

/* UPLOAD FILE */
router.post("/upload", protect, upload.single("file"), async (req, res) => {

  try {

    console.log("UPLOAD USER:", req.user?._id);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    res.json({ fileUrl });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }

});


module.exports = router;
