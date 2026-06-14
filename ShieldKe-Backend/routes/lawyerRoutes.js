const express = require("express");

const router = express.Router();

const User = require("../models/User");

/*
========================================
GET VERIFIED LAWYERS ONLY
========================================
*/

router.get("/", async (req, res) => {

  try {

    const lawyers =
      await User.find({

        role: "lawyer",

        isVerified: true,

        verificationStatus: "verified"

      })

      .select("-password")

      .sort({ createdAt: -1 });

    res.json(lawyers);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});


/*
========================================
GET SINGLE LAWYER
========================================
*/

router.get("/:id", async (req, res) => {

  try {

    const lawyer =
      await User.findOne({

        _id: req.params.id,

        role: "lawyer",

        isVerified: true,

        verificationStatus: "verified"

      })

      .select("-password");

    if (!lawyer) {

      return res.status(404).json({
        message:
          "Lawyer not found or not verified"
      });

    }

    res.json(lawyer);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

module.exports = router;