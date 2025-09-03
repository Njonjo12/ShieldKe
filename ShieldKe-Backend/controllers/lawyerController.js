// controllers/lawyerController.js
const LawyerProfile = require('../models/LawyerProfile');

// @desc    Create or update lawyer profile
// @route   POST /api/lawyer/profile
// @access  Private
const createLawyerProfile = async (req, res) => {
  try {
    const { licenseNumber, yearsOfExperience, practiceAreas, phone, location, bio } = req.body;

    let profile = await LawyerProfile.findOne({ user: req.user.id });

    if (profile) {
      // Update
      profile.licenseNumber = licenseNumber;
      profile.yearsOfExperience = yearsOfExperience;
      profile.practiceAreas = practiceAreas;
      profile.phone = phone;
      profile.location = location;
      profile.bio = bio;

      await profile.save();
      return res.json({ message: 'Profile updated', profile });
    }

    // Create new profile
    profile = new LawyerProfile({
      user: req.user.id,
      licenseNumber,
      yearsOfExperience,
      practiceAreas,
      phone,
      location,
      bio,
    });

    await profile.save();
    res.status(201).json({ message: 'Profile created', profile });

  } catch (err) {
    console.error('Error creating/updating lawyer profile:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get logged-in lawyer profile
// @route   GET /api/lawyer/profile
// @access  Private
const getLawyerProfile = async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ user: req.user.id }).populate('user', ['name', 'email', 'role']);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('Error fetching lawyer profile:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createLawyerProfile, getLawyerProfile };
