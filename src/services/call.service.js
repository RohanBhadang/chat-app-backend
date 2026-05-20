const crypto = require("crypto");
const User = require("../models/User.model");
const { checkIfConnected } = require("./connection.service");
const { CALL_STATUS, EVENTS } = require("../constants/call.constants");
const AppError = require("../utils/AppError");

const makeCallId = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(10).toString("hex");
};

class CallService {
  constructor(socketManager) {
    this.socketManager = socketManager;
    this.timeoutMs = 30000;
  }

  async verifyCallParticipants(callerId, calleeId) {
    if (!callerId || !calleeId) {
      throw new AppError("Caller and callee ids are required.", 400);
    }

    if (callerId === calleeId) {
      throw new AppError("Self calling is not allowed.", 400);
    }

    const [caller, callee] = await Promise.all([
      User.findById(callerId).select("_id name email"),
      User.findById(calleeId).select("_id name email"),
    ]);

    if (!caller || !callee) {
      throw new AppError("Caller or receiver not found.", 404);
    }

    const connected = await checkIfConnected(callerId, calleeId);
    if (!connected) {
      throw new AppError("Users are not connected. Calling is restricted to accepted connections.", 403);
    }

    return { caller, callee };
  }

  async createCallSession(callerId, calleeId, callType) {
    await this.verifyCallParticipants(callerId, calleeId);

    if (this.socketManager.getCallForUser(callerId)) {
      throw new AppError("Caller already has an active call.", 409);
    }

    if (this.socketManager.getCallForUser(calleeId)) {
      throw new AppError("Receiver is already in another call.", 409);
    }

    if (this.socketManager.isBusy(callerId) || this.socketManager.isBusy(calleeId)) {
      throw new AppError("Caller or receiver is busy.", 409);
    }

    const callId = makeCallId();
    const callState = {
      id: callId,
      callerId,
      calleeId,
      type: callType,
      status: CALL_STATUS.RINGING,
      createdAt: new Date(),
    };

    this.socketManager.addCall(callState);
    this.socketManager.setBusy(callerId);
    this.socketManager.setBusy(calleeId);

    this.socketManager.startCallTimeout(callId, this.timeoutMs, async (timedOutCallId) => {
      const activeCall = this.socketManager.getCall(timedOutCallId);
      if (!activeCall || activeCall.status !== CALL_STATUS.RINGING) return;

      await this.terminateCall(timedOutCallId, null, "timeout");
      this.socketManager.sendToUser(callerId, EVENTS.CALL_TIMEOUT, {
        callId: timedOutCallId,
        reason: "no_answer",
      });
      this.socketManager.sendToUser(calleeId, EVENTS.CALL_TIMEOUT, {
        callId: timedOutCallId,
        reason: "no_answer",
      });
    });

    return callState;
  }

  async acceptCall(callId, accepterId) {
    const callState = this.socketManager.getCall(callId);
    if (!callState) {
      throw new AppError("Call session not found.", 404);
    }

    if (callState.calleeId !== accepterId) {
      throw new AppError("Only the called user can accept this call.", 403);
    }

    if (callState.status !== CALL_STATUS.RINGING) {
      throw new AppError("Call is not in a valid state for acceptance.", 409);
    }

    callState.status = CALL_STATUS.IN_PROGRESS;
    this.socketManager.updateCall(callState);
    this.socketManager.clearCallTimeout(callId);
    return callState;
  }

  async rejectCall(callId, rejecterId) {
    const callState = this.socketManager.getCall(callId);
    if (!callState) {
      throw new AppError("Call session not found.", 404);
    }

    if (callState.calleeId !== rejecterId) {
      throw new AppError("Only the called user can reject this call.", 403);
    }

    await this.terminateCall(callId, rejecterId, "rejected");
    return callState;
  }

  async terminateCall(callId, endedByUserId, reason = "ended") {
    const callState = this.socketManager.getCall(callId);
    if (!callState) return null;

    const peerId = this.getPeerId(callState, endedByUserId);
    const payload = {
      callId,
      endedBy: endedByUserId || null,
      reason,
    };

    if (peerId) {
      this.socketManager.sendToUser(peerId, EVENTS.END_CALL, payload);
    }

    this.socketManager.removeCall(callId);
    return callState;
  }

  getPeerId(callState, userId) {
    if (!callState) return null;
    if (String(callState.callerId) === String(userId)) return callState.calleeId;
    if (String(callState.calleeId) === String(userId)) return callState.callerId;
    return null;
  }

  getCallForUser(userId) {
    return this.socketManager.getCallForUser(userId);
  }
}

module.exports = CallService;
