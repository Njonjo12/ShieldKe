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





/* =========================
   EXPRESS APP
========================= */

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());


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
INITIALIZE SOCKET.IO
======================*/

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});


/* =========================
   SOCKET.IO SETUP
========================= */

const Message = require("./models/Message");

io.on("connection", (socket) => {

  socket.on("joinRoom", (consultationId) => {
    socket.join(consultationId);
  });

  socket.on("sendMessage", async (data) => {

    try {

      const Message = require("./models/Message");

      const newMessage = await Message.create({
        consultation: data.consultation,
        sender: data.sender,
        text: data.text
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "name role");

      io.to(data.consultation).emit("receiveMessage", populatedMessage);

    } catch (err) {

      console.error("Socket message error:", err);

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
