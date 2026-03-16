const express = require("express");
const router = express.Router();
const { getMessages } = require("../controllers/messageController");

router.get("/:consultationId", getMessages);

module.exports = router;
