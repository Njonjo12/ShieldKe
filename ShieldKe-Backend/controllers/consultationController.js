const Consultation = require("../models/Consultation");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { notifyUser } = require("../utils/realtime");

/*
========================================
CLIENT — CREATE CONSULTATION
========================================
*/

const createConsultation = async (req, res) => {

  try {

    const { lawyerId, message } = req.body;

    /*
    ========================================
    CHECK LAWYER
    ========================================
    */

    const lawyer = await User.findById(lawyerId);

    if (!lawyer) {

      return res.status(404).json({
        message: "Lawyer not found"
      });

    }

    /*
    ========================================
    ONLY VERIFIED LAWYERS
    ========================================
    */

    if (
      lawyer.role !== "lawyer" ||
      !lawyer.isVerified ||
      lawyer.verificationStatus !== "verified"
    ) {

      return res.status(403).json({
        message:
          "This lawyer cannot receive consultations until approved by admin."
      });

    }

    /*
    ========================================
    CREATE CONSULTATION
    ========================================
    */

    const consultation = await Consultation.create({

      client: req.user._id,
      lawyer: lawyerId,
      message

    });

    /*
    ========================================
    NOTIFY LAWYER OF NEW REQUEST
    ========================================
    */

    try {

      const notification = await Notification.create({
        user: lawyerId,
        sender: req.user._id,
        relatedConsultation: consultation._id,
        title: "New Consultation Request",
        message: `${req.user.name} sent you a consultation request`,
        type: "consultation",
      });

      notifyUser(lawyerId, notification);

    } catch (notifyErr) {
      console.error("Consultation notification error:", notifyErr);
    }

    res.status(201).json(consultation);

  } catch (err) {

    console.error("Create consultation error:", err);

    res.status(500).json({
      message: "Server error"
    });

  }

};


/*
========================================
CLIENT — GET OWN CONSULTATIONS
========================================
*/

const getClientConsultations = async (req, res) => {

  try {

    const consultations =
      await Consultation.find({

        client: req.user._id

      })

      .populate(
        "lawyer",
        "name email verificationStatus isVerified"
      )

      .sort({ createdAt: -1 });

    res.json(consultations);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error"
    });

  }

};


/*
========================================
LAWYER — GET CONSULTATIONS
========================================
*/

const getLawyerConsultations = async (req, res) => {

  try {

    /*
    ========================================
    BLOCK REJECTED / PENDING LAWYERS
    ========================================
    */

    const lawyer =
      await User.findById(req.user._id);

    if (
      !lawyer.isVerified ||
      lawyer.verificationStatus !== "verified"
    ) {

      return res.status(403).json({
        message:
          "Your lawyer account has not yet been approved."
      });

    }

    const consultations =
      await Consultation.find({

        lawyer: req.user._id

      })

      .populate("client", "name email")

      .sort({ createdAt: -1 });

    res.json(consultations);

  } catch (err) {

    console.error(
      "Lawyer consultations error:",
      err
    );

    res.status(500).json({
      message: "Server error"
    });

  }

};


/*
========================================
LAWYER — UPDATE STATUS
========================================
*/

const updateConsultationStatus =
  async (req, res) => {

  try {

    const { status } = req.body;

    const consultation =
      await Consultation.findById(
        req.params.id
      );

    if (!consultation) {

      return res.status(404).json({
        message: "Consultation not found"
      });

    }

    /*
    ========================================
    ENSURE LAWYER OWNS CONSULTATION
    ========================================
    */

    if (
      consultation.lawyer.toString() !==
      req.user._id.toString()
    ) {

      return res.status(403).json({
        message: "Not authorized"
      });

    }

    consultation.status = status;

    await consultation.save();

    /*
    ========================================
    NOTIFY CLIENT OF STATUS CHANGE
    ========================================
    */

    try {

      const isAccepted = status === "accepted";

      const notification = await Notification.create({
        user: consultation.client,
        sender: req.user._id,
        relatedConsultation: consultation._id,
        title: isAccepted
          ? "Consultation Accepted"
          : "Consultation Declined",
        message: isAccepted
          ? `${req.user.name} accepted your consultation request`
          : `${req.user.name} declined your consultation request`,
        type: "consultation",
      });

      notifyUser(consultation.client, notification);

    } catch (notifyErr) {
      console.error("Status notification error:", notifyErr);
    }

    res.json(consultation);

  } catch (err) {

    console.error(
      "Update status error:",
      err
    );

    res.status(500).json({
      message: "Server error"
    });

  }

};

module.exports = {
  createConsultation,
  getClientConsultations,
  getLawyerConsultations,
  updateConsultationStatus
};