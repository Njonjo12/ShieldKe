// controllers/clientController.js
const ClientProfile = require('../models/ClientProfile');

// @desc    Create or update client profile
// @route   POST /api/client/profile
// @access  Private
const createClientProfile = async (req, res) => {
  try {
    const { phone, location, interests } = req.body;

    let profile = await ClientProfile.findOne({ user: req.user.id });

    if (profile) {
      // Update
      profile.phone = phone;
      profile.location = location;
      profile.interests = interests;

      await profile.save();
      return res.json({ message: 'Profile updated', profile });
    }

    // Create new profile
    profile = new ClientProfile({
      user: req.user.id,
      phone,
      location,
      interests,
    });

    await profile.save();
    res.status(201).json({ message: 'Profile created', profile });

  } catch (err) {
    console.error('Error creating/updating client profile:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get logged-in client profile
// @route   GET /api/client/profile
// @access  Private
const getClientProfile = async (req, res) => {
  try {
    const profile = await ClientProfile.findOne({ user: req.user.id }).populate('user', ['name', 'email', 'role']);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('Error fetching client profile:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createClientProfile, getClientProfile };
