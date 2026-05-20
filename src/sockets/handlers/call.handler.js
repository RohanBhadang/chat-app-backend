const CallService = require("../../services/call.service");
const { sendSocketError, sendSocketSuccess } = require("../../utils/socketResponse");
const {
  validateCallUserPayload,
  validateSignalPayload,
  validateCallActionPayload,
} = require("../../validations/call.validation");
const { EVENTS, CALL_TYPES } = require("../../constants/call.constants");

module.exports = (socket, socketManager) => {
  const callService = new CallService(socketManager);

  socket.on(EVENTS.CALL_USER, async (payload, ack) => {
    try {
      const validation = validateCallUserPayload(payload);
      if (!validation.valid) {
        return sendSocketError(socket, validation.message, "VALIDATION_ERROR", ack);
      }

      const callerId = socket.user._id.toString();
      const { targetUserId, callType } = payload;

      if (![CALL_TYPES.AUDIO, CALL_TYPES.VIDEO].includes(callType)) {
        return sendSocketError(socket, "Unsupported call type.", "INVALID_CALL_TYPE", ack);
      }

      if (callerId === targetUserId) {
        return sendSocketError(socket, "Self calling is not allowed.", "SELF_CALL", ack);
      }

      if (!socketManager.isUserOnline(targetUserId)) {
        return sendSocketError(socket, "Receiver is offline.", "USER_OFFLINE", ack);
      }

      if (socketManager.isBusy(targetUserId)) {
        socket.emit(EVENTS.USER_BUSY, { targetUserId, reason: "busy" });
        return sendSocketError(socket, "User is busy.", "USER_BUSY", ack);
      }

      const callState = await callService.createCallSession(callerId, targetUserId, callType);
      const incomingPayload = {
        callId: callState.id,
        callerId,
        callerName: socket.user.name,
        callType,
      };

      socketManager.sendToUser(targetUserId, EVENTS.INCOMING_CALL, incomingPayload);
      sendSocketSuccess(socket, { callId: callState.id }, ack);
    } catch (error) {
      console.error("call-user error:", error);
      sendSocketError(socket, error.message || "Cannot place call.", error.code || "CALL_INIT_FAILED", ack);
    }
  });

  socket.on(EVENTS.ACCEPT_CALL, async (payload, ack) => {
    try {
      const validation = validateCallActionPayload(payload);
      if (!validation.valid) {
        return sendSocketError(socket, validation.message, "VALIDATION_ERROR", ack);
      }

      const callId = payload.callId;
      const calleeId = socket.user._id.toString();
      const callState = await callService.acceptCall(callId, calleeId);
      const callerId = callState.callerId;

      socketManager.sendToUser(callerId, EVENTS.ACCEPT_CALL, {
        callId,
        calleeId,
      });

      sendSocketSuccess(socket, { callId }, ack);
    } catch (error) {
      console.error("accept-call error:", error);
      sendSocketError(socket, error.message || "Cannot accept call.", error.code || "ACCEPT_CALL_FAILED", ack);
    }
  });

  socket.on(EVENTS.REJECT_CALL, async (payload, ack) => {
    try {
      const validation = validateCallActionPayload(payload);
      if (!validation.valid) {
        return sendSocketError(socket, validation.message, "VALIDATION_ERROR", ack);
      }

      const callId = payload.callId;
      const calleeId = socket.user._id.toString();
      const callState = await callService.rejectCall(callId, calleeId);
      const callerId = callState.callerId;

      socketManager.sendToUser(callerId, EVENTS.REJECT_CALL, {
        callId,
        calleeId,
      });

      sendSocketSuccess(socket, { callId }, ack);
    } catch (error) {
      console.error("reject-call error:", error);
      sendSocketError(socket, error.message || "Cannot reject call.", error.code || "REJECT_CALL_FAILED", ack);
    }
  });

  socket.on(EVENTS.OFFER, (payload, ack) => {
    try {
      const validation = validateSignalPayload(payload);
      if (!validation.valid) {
        return sendSocketError(socket, validation.message, "VALIDATION_ERROR", ack);
      }

      const callState = socketManager.getCall(payload.callId);
      if (!callState) {
        return sendSocketError(socket, "Call session not found.", "CALL_NOT_FOUND", ack);
      }

      const senderId = socket.user._id.toString();
      const peerId = callService.getPeerId(callState, senderId);
      if (!peerId) {
        return sendSocketError(socket, "Peer not found for this call.", "PEER_NOT_FOUND", ack);
      }

      socketManager.sendToUser(peerId, EVENTS.OFFER, {
        callId: payload.callId,
        signal: payload.signal,
      });

      sendSocketSuccess(socket, { callId: payload.callId }, ack);
    } catch (error) {
      console.error("offer error:", error);
      sendSocketError(socket, error.message || "Failed to forward offer.", error.code || "OFFER_FAILED", ack);
    }
  });

  socket.on(EVENTS.ANSWER, (payload, ack) => {
    try {
      const validation = validateSignalPayload(payload);
      if (!validation.valid) {
        return sendSocketError(socket, validation.message, "VALIDATION_ERROR", ack);
      }

      const callState = socketManager.getCall(payload.callId);
      if (!callState) {
        return sendSocketError(socket, "Call session not found.", "CALL_NOT_FOUND", ack);
      }

      const senderId = socket.user._id.toString();
      const peerId = callService.getPeerId(callState, senderId);
      if (!peerId) {
        return sendSocketError(socket, "Peer not found for this call.", "PEER_NOT_FOUND", ack);
      }

      socketManager.sendToUser(peerId, EVENTS.ANSWER, {
        callId: payload.callId,
        signal: payload.signal,
      });

      sendSocketSuccess(socket, { callId: payload.callId }, ack);
    } catch (error) {
      console.error("answer error:", error);
      sendSocketError(socket, error.message || "Failed to forward answer.", error.code || "ANSWER_FAILED", ack);
    }
  });

  socket.on(EVENTS.ICE_CANDIDATE, (payload, ack) => {
    try {
      const validation = validateSignalPayload(payload);
      if (!validation.valid) {
        return sendSocketError(socket, validation.message, "VALIDATION_ERROR", ack);
      }

      const callState = socketManager.getCall(payload.callId);
      if (!callState) {
        return sendSocketError(socket, "Call session not found.", "CALL_NOT_FOUND", ack);
      }

      const senderId = socket.user._id.toString();
      const peerId = callService.getPeerId(callState, senderId);
      if (!peerId) {
        return sendSocketError(socket, "Peer not found for this call.", "PEER_NOT_FOUND", ack);
      }

      socketManager.sendToUser(peerId, EVENTS.ICE_CANDIDATE, {
        callId: payload.callId,
        signal: payload.signal,
      });

      sendSocketSuccess(socket, { callId: payload.callId }, ack);
    } catch (error) {
      console.error("ice-candidate error:", error);
      sendSocketError(socket, error.message || "Failed to forward ICE candidate.", error.code || "ICE_FAILED", ack);
    }
  });

  socket.on(EVENTS.END_CALL, async (payload, ack) => {
    try {
      const validation = validateCallActionPayload(payload);
      if (!validation.valid) {
        return sendSocketError(socket, validation.message, "VALIDATION_ERROR", ack);
      }

      const callId = payload.callId;
      const endedById = socket.user._id.toString();
      await callService.terminateCall(callId, endedById, "ended");
      sendSocketSuccess(socket, { callId }, ack);
    } catch (error) {
      console.error("end-call error:", error);
      sendSocketError(socket, error.message || "Failed to end call.", error.code || "END_CALL_FAILED", ack);
    }
  });
};
