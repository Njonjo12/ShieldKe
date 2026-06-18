/*
========================================
SHARED REALTIME HELPER

index.js creates the actual Socket.io
`io` instance and owns the `onlineUsers`
map. Controllers (which run as plain
Express routes, not inside the socket
connection handler) need a safe way to
emit a live "newNotification" event
without circularly require()-ing
index.js itself.

index.js calls setIO(io) once at startup
and uses `onlineUsers` from here (instead
of its own local object) so both files
share the exact same data.
========================================
*/

let io = null;
const onlineUsers = {};

function setIO(ioInstance) {
  io = ioInstance;
}

function notifyUser(userId, notification) {

  if (!userId) return;

  const socketId = onlineUsers[userId.toString()];

  if (io && socketId) {
    io.to(socketId).emit("newNotification", notification);
  }

}

module.exports = {
  setIO,
  onlineUsers,
  notifyUser
};
