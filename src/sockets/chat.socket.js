const socketAuth = require("./middlewares/socketAuth.middleware");
const SocketManager = require("./socketManager");
const registerChatHandlers = require("./handlers/chat.handler");
const registerCallHandlers = require("./handlers/call.handler");

module.exports = (io) => {
  const socketManager = new SocketManager(io);
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const userId = socketManager.registerSocket(socket);

    console.log("User connected:", userId);
    socketManager.emitOnlineUsers();

    registerChatHandlers(socket, socketManager);
    registerCallHandlers(socket, socketManager);

    socket.on("disconnect", () => {
      const disconnectedUserId = socketManager.removeSocket(socket.id);
      if (!disconnectedUserId) return;

      if (!socketManager.isUserOnline(disconnectedUserId)) {
        const activeCall = socketManager.getCallForUser(disconnectedUserId);
        if (activeCall) {
          socketManager.startDisconnectGrace(disconnectedUserId, (userId) => {
            const endedCall = socketManager.getCallForUser(userId);
            if (!endedCall) return;

            const peerId = endedCall.callerId === userId ? endedCall.calleeId : endedCall.callerId;
            socketManager.sendToUser(peerId, "end-call", {
              callId: endedCall.id,
              reason: "peer_disconnected",
            });
            socketManager.removeCall(endedCall.id);
          });
        }
      }

      socketManager.emitOnlineUsers();
      console.log("User disconnected:", disconnectedUserId);
    });
  });
};
