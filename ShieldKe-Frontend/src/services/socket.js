import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default socket;





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
   ALLOWED ORIGINS
   FRONTEND_URL is set in Render's env
   vars to the live Vercel URL. localhost
   stays in the list too so local dev
   keeps working unchanged.
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);


/* =========================
   EXPRESS APP
========================= */


const app = express();

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

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

    origin: allowedOrigins,

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
const realtime = require("./utils/realtime");


/* =========================
   ONLINE USERS
========================= */

const onlineUsers = realtime.onlineUsers;
realtime.setIO(io);


/* =========================
   SOCKET.IO SETUP
========================= */
io.on("connection", (socket) => {

  console.log("⚡ User connected:", socket.id);

    /* ──────────────────────────────────────────
     CALL: Caller initiates → relay to room
     + create a persistent notification so the
     recipient sees it on the bell / notifications
     page even if they're not in the chat room.
  ────────────────────────────────────────── */
  socket.on("call-user", async ({ consultationId, callType, offer, callerName, callerId }) => {

    /* existing live signaling — unchanged */
    socket.to(consultationId).emit("incoming-call", {
      callType,
      offer,
      callerName,
    });

    /* new: persisted notification */
    try {

      if (!callerId) return;

      const consultation = await Consultation.findById(consultationId);
      if (!consultation) return;

      const recipient =
        consultation.client.toString() === callerId
          ? consultation.lawyer
          : consultation.client;

      const notification = await Notification.create({
        user: recipient,
        sender: callerId,
        relatedConsultation: consultationId,
        title: `Incoming ${callType === "video" ? "Video" : "Voice"} Call`,
        message: `${callerName} is calling you`,
        type: "call",
      });

      const recipientSocket = onlineUsers[recipient.toString()];

      if (recipientSocket) {
        io.to(recipientSocket).emit("newNotification", notification);
      }

    } catch (error) {
      console.error("Call notification error:", error);
    }

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

          sender: message.sender,

          relatedConsultation:
            message.consultation,

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




import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../socket";
import CallWindow from "./CallWindow";
import { FiPhone, FiX } from "react-icons/fi";

/*
========================================
GLOBAL CALL MANAGER

Mounted once at the app root (see App.jsx),
outside any specific page or chat window,
so an incoming call is detected and shown
no matter what page the user is currently
on — browsing lawyers, editing their
profile, reading notifications, anywhere.

This is now the ONLY place that listens for
"incoming-call". ChatWindow.jsx no longer
has its own copy of this listener — having
two active listeners at once would mean two
banners / two CallWindows fighting over the
same event whenever a chat happened to be
open at the moment a call came in.

It also re-registers the current user with
the socket server on every route change.
That isn't just for calls — the same
"registerUser" emit is what the backend
uses to know which socket belongs to which
user for ALL live push notifications (new
messages, consultation updates, etc). Before
this, that registration only ever happened
inside ChatWindow, meaning a user who hadn't
yet opened a chat this session was never
marked online at all.
========================================
*/

function Avatar({ name, size = 44 }) {
  const initials = (name || "?")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#00A86B22", border: "2px solid #00A86B40",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 800, color: "#00A86B",
      flexShrink: 0, fontFamily: "inherit",
    }}>
      {initials}
    </div>
  );
}

export default function GlobalCallManager() {

  const location = useLocation();
  const [incomingCall, setIncomingCall] = useState(null); // { consultationId, callType, offer, callerName }
  const [activeCall, setActiveCall] = useState(null);      // set once the user accepts

  /* ── keep this user registered as online on every navigation,
        not just when a chat happens to be open ── */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?._id) {
      socket.emit("registerUser", user._id);
    }
  }, [location.pathname]);

  /* ── single, app-wide incoming-call listener ── */
  useEffect(() => {
    const handleIncoming = ({ consultationId, callType, offer, callerName }) => {
      setIncomingCall({ consultationId, callType, offer, callerName });
    };
    socket.on("incoming-call", handleIncoming);
    return () => socket.off("incoming-call", handleIncoming);
  }, []);

  const acceptCall = () => {
    setActiveCall(incomingCall);
    setIncomingCall(null);
  };

  const declineCall = () => {
    if (incomingCall) {
      socket.emit("call-rejected", { consultationId: incomingCall.consultationId });
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    setActiveCall(null);
  };

  return (
    <>
      {/* ── FULL-SCREEN CALL OVERLAY (once accepted) ── */}
      <AnimatePresence>
        {activeCall && (
          <CallWindow
            consultationId={activeCall.consultationId}
            callType={activeCall.callType}
            isIncoming={true}
            offer={activeCall.offer}
            callerName={activeCall.callerName}
            onEnd={endCall}
          />
        )}
      </AnimatePresence>

      {/* ── INCOMING CALL BANNER ──
          width: calc(100vw - 32px) + left: 16px is the correct
          mobile approach. On real mobile browsers, scrollbars are
          overlay (0px wide), so 100vw equals the actual viewport
          width and the banner gets exactly 16px margins each side.
          We avoid both left+right (headless Chrome quirk) and
          left:50%+transform (framer-motion transform conflict). */}
      <AnimatePresence>
        {incomingCall && !activeCall && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            style={{
              position: "fixed",
              top: 16,
              left: 16,
              width: "calc(100vw - 32px)",
              maxWidth: 440,
              zIndex: 9999,
              background: "#0B1F3A",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <motion.div
                animate={{ scale: [1, 1.22, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <Avatar name={incomingCall.callerName} size={44} />
              </motion.div>
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: "#22C55E", border: "2px solid #0B1F3A" }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {incomingCall.callerName}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2, whiteSpace: "nowrap" }}>
                Incoming {incomingCall.callType === "video" ? "📹 video" : "📞 audio"} call
              </div>
            </div>

            <button
              onClick={acceptCall}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg,#006B3F,#00A86B)",
                border: "none", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,107,63,0.4)", flexShrink: 0,
              }}
            >
              <FiPhone size={17} color="#fff" />
            </button>

            <button
              onClick={declineCall}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", flexShrink: 0,
              }}
            >
              <FiX size={17} color="#F87171" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
