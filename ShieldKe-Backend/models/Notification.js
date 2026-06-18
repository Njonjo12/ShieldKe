const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(

  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },

    relatedConsultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      required: false
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: [
        "message",
        "consultation",
        "payment",
        "verification",
        "call",
        "system"
      ],
      default: "system"
    },

    isRead: {
      type: Boolean,
      default: false
    }

  },

  {
    timestamps: true
  }

);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);