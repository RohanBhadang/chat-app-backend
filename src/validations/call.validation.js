const { Types } = require("mongoose");
const { CALL_TYPES } = require("../constants/call.constants");

const isValidObjectId = (value) => {
  return typeof value === "string" && Types.ObjectId.isValid(value);
};

exports.validateCallUserPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return { valid: false, message: "Call payload must be an object." };
  }

  const { targetUserId, callType } = payload;

  if (!isValidObjectId(targetUserId)) {
    return { valid: false, message: "targetUserId is required and must be a valid user id." };
  }

  if (!Object.values(CALL_TYPES).includes(callType)) {
    return {
      valid: false,
      message: "callType must be either 'audio' or 'video'.",
    };
  }

  return { valid: true };
};

exports.validateSignalPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return { valid: false, message: "Signal payload must be an object." };
  }

  const { callId, signal } = payload;

  if (!isValidObjectId(callId) && typeof callId !== "string") {
    return { valid: false, message: "callId is required." };
  }

  if (!signal || typeof signal !== "object") {
    return { valid: false, message: "signal data is required." };
  }

  return { valid: true };
};

exports.validateCallActionPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return { valid: false, message: "Call action payload must be an object." };
  }

  const { callId } = payload;

  if (!isValidObjectId(callId) && typeof callId !== "string") {
    return { valid: false, message: "callId is required." };
  }

  return { valid: true };
};
