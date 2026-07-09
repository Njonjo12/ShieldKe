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

/* =========================
   CORS
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://shield-ke-2gpd.vercel.app",
  "https://shieldke.co.ke",
  "https://www.shieldke.co.ke",
];
app.use(
  cors({
    origin: function (origin, callback) {
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
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://shield-ke-2gpd.vercel.app",
        "https://shieldke.co.ke",
        "https://www.shieldke.co.ke",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }

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
