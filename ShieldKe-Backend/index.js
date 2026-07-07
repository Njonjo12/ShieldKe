/* =========================
   DEPENDENCIES
========================= */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();


/* =========================
   ROUTE IMPORTS
========================= */

const authRoutes = require("./routes/authRoutes");
const consultationRoutes = require("./routes/consultationRoutes");

const messageRoutes = require("./routes/messageRoutes")
const lawyerRoutes = require("./routes/lawyerRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");
  const adminRoutes =
  require("./routes/adminRoutes");






/* =========================
   EXPRESS APP
========================= */


const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://shield-ke-2gpd.vercel.app",
  "https://shield.co.ke",
  "https://www.shield.co.ke",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/admin", adminRoutes);

/*
========================================
ICE CONFIGURATION ENDPOINT

Returns STUN + TURN server config to the
frontend when it's about to start a call.
Keeping credentials on the backend (even
though they're currently public/free ones)
means you can upgrade to private Twilio or
Metered credentials later by just changing
env vars — no frontend redeploy needed.

FREE TURN via Metered Open Relay is used
by default. It works globally and handles
symmetric NAT (the main reason STUN-only
calls fail on Kenyan mobile networks).

For a production upgrade:
  1. Sign up at metered.ca (or Twilio)
  2. Set TURN_USERNAME and TURN_CREDENTIAL
     in your Render environment variables
  3. The endpoint picks them up automatically

The credentials expire after 24 hours
(Twilio NTS pattern) — for now we use
static free credentials so there's no
TTL needed.
========================================
*/

app.get("/api/calls/ice-config", (req, res) => {

  const turnUsername   = process.env.TURN_USERNAME   || "openrelayproject";
  const turnCredential = process.env.TURN_CREDENTIAL || "openrelayproject";

  const iceServers = [

    /* STUN — fast candidate discovery */
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:openrelay.metered.ca:80"  },

    /* TURN UDP 80 — works through most firewalls */
    {
      urls: "turn:openrelay.metered.ca:80",
      username:   turnUsername,
      credential: turnCredential
    },

    /* TURN UDP 443 */
    {
      urls: "turn:openrelay.metered.ca:443",
      username:   turnUsername,
      credential: turnCredential
    },

    /* TURN TCP 443 — works even when UDP is blocked */
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username:   turnUsername,
      credential: turnCredential
    },

    /* TURNS (TLS) — for networks that block plain TURN */
    {
      urls: "turns:openrelay.metered.ca:443?transport=tcp",
      username:   turnUsername,
      credential: turnCredential
    }

  ];

  res.json({ iceServers });

});





/* =========================
   DATABASE CONNECTION
========================= */

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connected");
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});


/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/lawyers", lawyerRoutes);
app.use("/api/notifications", notificationRoutes);




/* =========================
   HEALTH CHECK ROUTE
========================= */

app.get("/", (req, res) => {
  res.send("ShieldKe API is running 🚀");
});


/* =========================
   CREATE HTTP SERVER
========================= */

const server = http.createServer(app);

/*=========================
/*=========================
INITIALIZE SOCKET.IO
======================*/

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://shield-ke-2gpd.vercel.app",
      "https://shield.co.ke",
      "https://www.shield.co.ke",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});


/* =========================
   MODELS
========================= */

const Message = require("./models/Message");
const Consultation = require("./models/Consultation");
const Notification = require("./models/Notification");


/* =========================
   ONLINE USERS
========================= */

const onlineUsers = {};


/* =========================
   SOCKET.IO SETUP
========================= */
io.on("connection", (socket) => {

  console.log("⚡ User connected:", socket.id);

    /* ──────────────────────────────────────────
     CALL: Caller initiates → relay to room
  ────────────────────────────────────────── */
  socket.on("call-user", ({ consultationId, callType, offer, callerName }) => {
    socket.to(consultationId).emit("incoming-call", {
      callType,
      offer,
      callerName,
    });
  });

  /* ──────────────────────────────────────────
     CALL: Callee accepts → relay answer to caller
  ────────────────────────────────────────── */
  socket.on("call-accepted", ({ consultationId, answer }) => {
    socket.to(consultationId).emit("call-accepted", { answer });
  });

  /* ──────────────────────────────────────────
     CALL: Callee rejects → notify caller
  ────────────────────────────────────────── */
  socket.on("call-rejected", ({ consultationId }) => {
    socket.to(consultationId).emit("call-rejected");
  });

  /* ──────────────────────────────────────────
     CALL: Either party ends call → notify other
  ────────────────────────────────────────── */
  socket.on("call-ended", ({ consultationId }) => {
    socket.to(consultationId).emit("call-ended");
  });

  /* ──────────────────────────────────────────
     ICE CANDIDATES: WebRTC NAT traversal relay
     (must relay every candidate as it arrives)
  ────────────────────────────────────────── */
  socket.on("ice-candidate", ({ consultationId, candidate }) => {
    socket.to(consultationId).emit("ice-candidate", { candidate });
  });

/*

  /*
  ========================================
  REGISTER USER SOCKET
  ========================================
  */

  socket.on("registerUser", (userId) => {

    onlineUsers[userId] = socket.id;

    console.log("✅ Registered user:", userId);

  });

  /*
  ========================================
  JOIN CONSULTATION ROOM
  ========================================
  */

  socket.on("joinRoom", (consultationId) => {

    socket.join(consultationId);

    console.log(`📌 Joined room: ${consultationId}`);

  });

  /*
  ========================================
  TYPING INDICATOR
  ========================================
  */

  socket.on("typing", (room) => {

    socket.to(room).emit("typing");

  });

  /*
  ========================================
  STOP TYPING
  ========================================
  */

  socket.on("stopTyping", (room) => {

    socket.to(room).emit("stopTyping");

  });

  /*
  ========================================
  SEND MESSAGE
  ========================================
  */

  socket.on("sendMessage", async (message) => {

    try {

      if (!message.sender) {

        console.log("❌ sender missing");

        return;

      }

      /*
      ========================================
      SAVE MESSAGE
      ========================================
      */

      const newMessage =
        await Message.create({

          consultation:
            message.consultation,

          sender:
            message.sender,

          text:
            message.text || "",

          fileUrl:
            message.fileUrl || ""

        });

      const populated =
        await newMessage.populate(
          "sender",
          "name role profilePhoto"
        );

      /*
      ========================================
      EMIT MESSAGE
      ========================================
      */

      io.to(message.consultation)
        .emit(
          "receiveMessage",
          populated
        );

      /*
      ========================================
      CREATE NOTIFICATION
      ========================================
      */

      const consultation =
        await Consultation.findById(
          message.consultation
        );

      if (!consultation) return;

      /*
      ========================================
      DETERMINE RECIPIENT
      ========================================
      */

      let recipient;

      if (
        consultation.client.toString() ===
        message.sender
      ) {

        recipient =
          consultation.lawyer;

      } else {

        recipient =
          consultation.client;

      }

      /*
      ========================================
      SAVE NOTIFICATION
      ========================================
      */

      const notification =
        await Notification.create({

          user: recipient,

          title: "New Message",

          message:
            "You received a new message",

          type: "message"

        });

      /*
      ========================================
      SEND REAL-TIME NOTIFICATION
      ========================================
      */

      const recipientSocket =
        onlineUsers[
          recipient.toString()
        ];

      if (recipientSocket) {

        io.to(recipientSocket)
          .emit(
            "newNotification",
            notification
          );

      }

    } catch (error) {

      console.error(
        "Message save error:",
        error
      );

    }

  });

  /*
  ========================================
  DISCONNECT
  ========================================
  */

  socket.on("disconnect", () => {

    console.log("❌ User disconnected");

    for (const userId in onlineUsers) {

      if (
        onlineUsers[userId] ===
        socket.id
      ) {

        delete onlineUsers[userId];

        break;

      }

    }

  });

});



/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(`🚀 ShieldKe server running on port ${PORT}`);

});
