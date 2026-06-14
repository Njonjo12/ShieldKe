const User = require("../models/User");
const Consultation = require("../models/Consultation");

exports.getDashboardStats = async (req, res) => {

  try {

    const totalLawyers = await User.countDocuments({
      role: "lawyer"
    });

    const verifiedLawyers = await User.countDocuments({
      role: "lawyer",
      verificationStatus: "verified"
    });

    const pendingLawyers = await User.countDocuments({
      role: "lawyer",
      verificationStatus: "pending"
    });

    const totalConsultations = await Consultation.countDocuments();

    res.json({
      totalLawyers,
      verifiedLawyers,
      pendingLawyers,
      totalConsultations
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};
