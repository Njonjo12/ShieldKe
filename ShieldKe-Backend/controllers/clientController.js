const ClientProfile = require("../models/ClientProfile");

// Create or update client profile
const createClientProfile = async (req, res) => {
  try {
    const { phone, location, bio } = req.body;

    const existingProfile = await ClientProfile.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      const updated = await ClientProfile.findOneAndUpdate(
        { user: req.user._id },
        { phone, location, bio },
        { new: true }
      );
      return res.json({
        success: true,
        message: "Client profile updated",
        profile: updated,
      });
    }

    const profile = await ClientProfile.create({
      user: req.user._id,
      phone,
      location,
      bio,
    });

    res.status(201).json({
      success: true,
      message: "Client profile created",
      profile,
    });
  } catch (error) {
    console.error("Create Client Profile Error:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get logged-in client profile
const getClientProfile = async (req, res) => {
  const profile = await ClientProfile.findOne({
    user: req.user._id,
  }).populate("user", "name email role");

  if (!profile) {
    return res.status(404).json({
      success: false,
      error: "Client profile not found",
    });
  }

  res.json({ success: true, profile });
};

module.exports = {
  createClientProfile,
  getClientProfile,
};
