// controllers/consultationController.js

const Consultation = require("../models/Consultation");
const User = require("../models/User");


/*
========================================
CLIENT — Create Consultation Request
POST /api/consultations
========================================
*/
const createConsultation = async (req, res) => {
  try {
    const { lawyerId, message } = req.body;

    const consultation = await Consultation.create({
      client: req.user._id,
      lawyer: lawyerId,
      message
    });

    res.status(201).json(consultation);
  } catch (err) {
    console.error("Create consultation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/*
========================================
CLIENT — Get Own Consultations
GET /api/consultations
========================================
*/
const getClientConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      client: req.user._id
    }).populate("lawyer", "name email")
      .sort({createAt: -1});

    res.json(consultations);
  } catch (err) {
    
    res.status(500).json({ message: "Server error" });
  }
};


/*
========================================
LAWYER — Get Requests Sent To Them
GET /api/consultations/lawyer
========================================
*/
const getLawyerConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      lawyer: req.user._id
    }).populate("client", "name email");

    res.json(consultations);
  } catch (err) {
    console.error("Lawyer consultations error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/*
========================================
LAWYER — Accept / Reject Consultation
PUT /api/consultations/:id/status
========================================
*/
const updateConsultationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    // ensure only assigned lawyer updates
    if (consultation.lawyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    consultation.status = status;
    await consultation.save();

    res.json(consultation);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  createConsultation,
  getClientConsultations,
  getLawyerConsultations,
  updateConsultationStatus
};
