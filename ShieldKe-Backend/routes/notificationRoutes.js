const express = require("express");

const router = express.Router();

const Notification = require("../models/Notification");

const { protect } = require("../middleware/authMiddleware");


/*
========================================
GET USER NOTIFICATIONS
========================================
*/

router.get("/", protect, async (req, res) => {

  try {

    const notifications = await Notification.find({
      user: req.user._id
    })

    .populate("sender", "name profilePhoto role")

    .populate("relatedConsultation", "client lawyer status")

    .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});


/*
========================================
MARK AS READ
========================================
*/

router.put("/:id/read", protect, async (req, res) => {

  try {

    const notification =
      await Notification.findById(req.params.id);

    if (!notification) {

      return res.status(404).json({
        message: "Notification not found"
      });

    }

    notification.isRead = true;

    await notification.save();

    res.json(notification);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

module.exports = router;