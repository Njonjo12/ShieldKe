const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createConsultation,
  getClientConsultations,
  getLawyerConsultations,
  updateConsultationStatus
} = require("../controllers/consultationController");

const Consultation = require("../models/Consultation");

/* ===============================
   CLIENT ROUTES
================================ */

/* Create consultation request */

router.post(
  "/",
  protect,
  authorize("client"),
  createConsultation
);


/* Get consultations for logged-in client
   This supports BOTH routes:

   /api/consultations
   /api/consultations/client
*/

router.get(
  "/",
  protect,
  authorize("client"),
  getClientConsultations
);

router.get(
  "/client",
  protect,
  authorize("client"),
  getClientConsultations
);


/* ===============================
   LAWYER ROUTES
================================ */

router.get(
  "/lawyer",
  protect,
  authorize("lawyer"),
  getLawyerConsultations
);

router.put(
  "/:id/status",
  protect,
  authorize("lawyer"),
  updateConsultationStatus
);


/* ===============================
   DEBUG ROUTE (DEV ONLY)
================================ */

router.get("/debug/all", async (req, res) => {

  try {

    const consultations = await Consultation.find()
      .populate("client", "name email role")
      .populate("lawyer", "name email role");

    res.json(consultations);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

});

module.exports = router;
