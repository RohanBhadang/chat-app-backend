const { CALL_STATUS } = require("../constants/call.constants");

class SocketManager {
  constructor(io) {
    this.io = io;
    this.userSocketIds = new Map();
    this.socketToUser = new Map();
    this.activeCalls = new Map();
    this.userCallMap = new Map();
    this.busyUsers = new Set();
    this.callTimeouts = new Map();
    this.disconnectGraceTimers = new Map();
    this.reconnectGraceMs = 20000;
  }

  registerSocket(socket) {
    const userId = socket.user._id.toString();

    if (this.disconnectGraceTimers.has(userId)) {
      clearTimeout(this.disconnectGraceTimers.get(userId));
      this.disconnectGraceTimers.delete(userId);
    }

    if (!this.userSocketIds.has(userId)) {
      this.userSocketIds.set(userId, new Set());
    }

    this.userSocketIds.get(userId).add(socket.id);
    this.socketToUser.set(socket.id, userId);
    socket.join(userId);

    return userId;
  }

  removeSocket(socketId) {
    const userId = this.socketToUser.get(socketId);
    if (!userId) return null;

    const sockets = this.userSocketIds.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSocketIds.delete(userId);
      }
    }

    this.socketToUser.delete(socketId);

    return userId;
  }

  getSocketIds(userId) {
    return Array.from(this.userSocketIds.get(userId) || []);
  }

  getOnlineUsers() {
    return Array.from(this.userSocketIds.keys());
  }

  emitOnlineUsers() {
    this.io.emit("online_users", this.getOnlineUsers());
  }

  sendToUser(userId, event, payload) {
    this.io.to(userId).emit(event, payload);
  }

  isUserOnline(userId) {
    return this.userSocketIds.has(userId);
  }

  isBusy(userId) {
    return this.busyUsers.has(userId);
  }

  setBusy(userId) {
    this.busyUsers.add(userId);
  }

  clearBusy(userId) {
    this.busyUsers.delete(userId);
  }

  addCall(callState) {
    const { id, callerId, calleeId } = callState;
    this.activeCalls.set(id, callState);
    this.userCallMap.set(callerId, id);
    this.userCallMap.set(calleeId, id);
  }

  getCall(callId) {
    return this.activeCalls.get(callId);
  }

  getCallForUser(userId) {
    const callId = this.userCallMap.get(userId);
    if (!callId) return null;
    return this.activeCalls.get(callId) || null;
  }

  updateCall(callState) {
    if (!callState || !callState.id) return;
    this.activeCalls.set(callState.id, callState);
  }

  removeCall(callId) {
    const callState = this.activeCalls.get(callId);
    if (!callState) return;

    this.userCallMap.delete(callState.callerId);
    this.userCallMap.delete(callState.calleeId);
    this.activeCalls.delete(callId);
    this.clearBusy(callState.callerId);
    this.clearBusy(callState.calleeId);
    this.clearCallTimeout(callId);
  }

  startCallTimeout(callId, timeoutMs, callback) {
    this.clearCallTimeout(callId);

    const timer = setTimeout(() => {
      this.callTimeouts.delete(callId);
      callback(callId);
    }, timeoutMs);

    this.callTimeouts.set(callId, timer);
  }

  clearCallTimeout(callId) {
    const timer = this.callTimeouts.get(callId);
    if (timer) {
      clearTimeout(timer);
      this.callTimeouts.delete(callId);
    }
  }

  startDisconnectGrace(userId, callback) {
    this.clearDisconnectGrace(userId);

    const timer = setTimeout(() => {
      this.disconnectGraceTimers.delete(userId);
      callback(userId);
    }, this.reconnectGraceMs);

    this.disconnectGraceTimers.set(userId, timer);
  }

  clearDisconnectGrace(userId) {
    const timer = this.disconnectGraceTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectGraceTimers.delete(userId);
    }
  }
}

module.exports = SocketManager;
