const LawyerProfile = require("../models/LawyerProfile");

// Create or update lawyer profile
const createLawyerProfile = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role,
      specialization,
      yearsOfExperience,
      location,
      bio,
      consultationFee
    } = req.body;
    

    let profile = await LawyerProfile.findOne({ user: req.user.id });

    if (profile) {
      profile = await LawyerProfile.findOneAndUpdate(
        { user: req.user.id },
        {
          licenseNumber,
          yearsOfExperience,
          practiceAreas,
          phone,
          location,
          bio
        },
        { new: true }
      );
      return res.json({ message: "Profile updated", profile });
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    
      specialization,
      yearsOfExperience,
      location,
      bio,
      consultationFee
    });
    

    res.status(201).json({ message: "Profile created", profile });
  } catch (error) {
    console.error("Error creating/updating lawyer profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get logged-in lawyer profile
const getLawyerProfile = async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ user: req.user.id }).populate(
      "user",
      "name email role"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ PUBLIC: List all lawyers (Client browsing)
const listLawyers = async (req, res) => {
  try {
    const lawyers = await LawyerProfile.find().populate(
      "user",
      "name email"
    );
    res.json(lawyers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createLawyerProfile,
  getLawyerProfile,
  listLawyers
};
