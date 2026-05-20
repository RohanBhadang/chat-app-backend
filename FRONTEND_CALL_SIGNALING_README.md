# Frontend Integration Guide for One-to-One Call Signaling

This document describes the backend socket changes implemented for one-to-one audio/video calling signaling. It is intended for frontend work only and can be shared with Copilot for building the UI and WebRTC client logic.

---

## Overview

The backend now supports production-ready one-to-one WebRTC signaling using Socket.IO. Existing chat and messaging functionality remains unchanged.

Implemented backend capabilities:
- One-to-one video call signaling
- One-to-one audio call signaling
- Incoming call notification
- Accept/reject call
- SDP offer/answer exchange
- ICE candidate relay
- End call
- Busy state handling
- Call timeout handling
- Disconnect cleanup
- Reconnection grace handling
- Active call state tracking

The backend architecture is modular and intentional:
- `src/sockets/chat.socket.js` is the central Socket.IO bootstrap
- `src/sockets/handlers/chat.handler.js` preserves chat behavior
- `src/sockets/handlers/call.handler.js` handles call signaling events
- `src/sockets/socketManager.js` manages user sockets, active calls, busy state, and cleanup
- `src/services/call.service.js` contains session lifecycle rules and validation
- `src/sockets/middlewares/socketAuth.middleware.js` protects socket connections with JWT
- `src/validations/call.validation.js` validates incoming call payloads

---

## Authentication

Socket connections must authenticate using JWT via `socket.handshake.auth.token`.

Example client connect:
```js
const socket = io(SERVER_URL, {
  auth: {
    token: accessToken,
  },
});
```

The backend verifies the token and attaches `socket.user` before allowing any events.

---

## Existing chat events (unchanged)

These chat events continue to work as before:
- `join_chat` -> join a chat room
- `send_message` -> send a message in a chat room
- `receive_message` -> receive chat messages
- `new_notification` -> new message notification
- `online_users` -> current online user ids

---

## Call signaling events

### 1. `call-user`
Emitted by caller to start a call.

Payload:
```js
{
  targetUserId: string,
  callType: "audio" | "video"
}
```

Acknowledgement response:
- success: `{ status: "success", data: { callId } }`
- error: `{ status: "error", code, message }`

Behavior:
- validates caller / callee
- checks user connection relationship
- checks busy state
- creates a call session
- sends `incoming-call` to the receiver

### 2. `incoming-call`
Received by callee when someone calls them.

Payload from backend:
```js
{
  callId: string,
  callerId: string,
  callerName: string,
  callType: "audio" | "video"
}
```

### 3. `accept-call`
Emitted by callee to accept the incoming call.

Payload:
```js
{
  callId: string,
}
```

On success, the backend forwards `accept-call` to the caller.

### 4. `reject-call`
Emitted by callee to reject the incoming call.

Payload:
```js
{
  callId: string,
}
```

On success, the backend forwards `reject-call` to the caller.

### 5. `offer`
Emitted by the caller after creating an SDP offer.

Payload:
```js
{
  callId: string,
  signal: object
}
```

The backend relays it to the callee.

### 6. `answer`
Emitted by the callee after creating an SDP answer.

Payload:
```js
{
  callId: string,
  signal: object
}
```

The backend relays it to the caller.

### 7. `ice-candidate`
Emitted by either peer to relay ICE candidates.

Payload:
```js
{
  callId: string,
  signal: object
}
```

The backend relays it to the other peer.

### 8. `end-call`
Emitted by either peer to end a call.

Payload:
```js
{
  callId: string,
}
```

The backend also emits `end-call` to the other peer with:
```js
{
  callId,
  endedBy: string | null,
  reason: "ended" | "peer_disconnected"
}
```

### 9. `user-busy`
If the callee is busy, the backend can emit `user-busy` or return a busy error during `call-user`.

### 10. `call-timeout`
If a call is not answered within the backend timeout window, the backend emits:
```js
{
  callId: string,
  reason: "no_answer"
}
```

---

## Frontend integration notes

### Recommended signaling flow

1. Caller sends `call-user` with `targetUserId` and `callType`.
2. Callee receives `incoming-call` and shows a ringing UI.
3. Callee sends `accept-call` or `reject-call`.
4. Caller receives `accept-call` and creates the peer connection offer.
5. Caller emits `offer` with the SDP.
6. Callee receives `offer`, sets remote description, and emits `answer`.
7. Caller receives `answer` and completes the peer connection.
8. Both peers exchange ICE candidates through `ice-candidate`.
9. Either side can emit `end-call` to terminate.

### Important frontend behavior

- Always attach `callId` to offer/answer/ICE events.
- Use acknowledgements to detect backend errors and show UI feedback.
- Handle `incoming-call`, `accept-call`, `reject-call`, `end-call`, and `call-timeout` by updating call UI state.
- If reconnecting, the backend supports a short grace window for call retention, but the frontend should re-auth socket and re-establish state promptly.
- Do not bypass backend event validation; send only properly shaped payloads.

---

## Applicable backend files

These backend files are the source of truth for the frontend contract:
- `src/sockets/chat.socket.js`
- `src/sockets/handlers/call.handler.js`
- `src/sockets/handlers/chat.handler.js`
- `src/sockets/socketManager.js`
- `src/services/call.service.js`
- `src/validations/call.validation.js`
- `src/constants/call.constants.js`
- `src/sockets/middlewares/socketAuth.middleware.js`

---

## Summary of frontend-facing changes

- Added a secure socket auth middleware for JWT-authenticated sockets.
- Added modular call signaling alongside existing chat handlers.
- Added new call lifecycle events required for WebRTC.
- Kept existing chat and messaging events unchanged.
- Added busy-state and call timeout semantics.
- Added safer disconnect handling and active call cleanup.

---

## Usage guidance for Copilot

Give Copilot this file when building the frontend to ensure it understands:
- the exact Socket.IO event names
- required payload shapes
- expected ack response format
- how incoming calls and call state should be managed
- that this task is backend-only and no backend API changes should be assumed beyond these events

---

## Example client event registration

```js
socket.on("incoming-call", handleIncomingCall);
socket.on("accept-call", handleCallAccepted);
socket.on("reject-call", handleCallRejected);
socket.on("offer", handleOffer);
socket.on("answer", handleAnswer);
socket.on("ice-candidate", handleIceCandidate);
socket.on("end-call", handleCallEnded);
socket.on("call-timeout", handleCallTimeout);
```

```js
socket.emit("call-user", { targetUserId, callType: "video" }, (response) => {
  if (response.status === "error") {
    showToast(response.message);
  }
});
```

---

## Final note

This README is strictly for frontend integration. It does not include frontend implementation code, only the backend contract and event definitions.
