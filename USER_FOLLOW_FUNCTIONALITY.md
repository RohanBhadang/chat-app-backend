# User Follow & Connection Request Functionality

## Overview

This document describes the **Follow** and **Connection Request** system that allows users to connect with each other in the chat application. Users can send connection requests, accept/reject them, and mark them as interested or ignored.

---

## Features

### 1. **Send Connection Request**
Users can send a connection request to other users with different statuses:
- **interested**: User is interested in connecting
- **ignored**: User wants to ignore the potential connection

### 2. **Review Connection Request**
Users can review incoming requests and:
- **Accept**: Accept the connection request to establish a connection
- **Reject**: Reject the connection request

### 3. **View All Users**
Retrieve a list of all available users (excluding the current user)

---

## Connection Request Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                  CONNECTION REQUEST FLOW                    │
└─────────────────────────────────────────────────────────────┘

USER A                                          USER B
  │                                               │
  ├──────── Send Request (interested) ───────────>
  │         Status: "interested"                 │
  │                                               │
  │                                    Request received
  │                                               │
  │                    <────── Accept/Reject ────┤
  │                      Status: "accepted"      │
  │                      Status: "rejected"      │
  │                                               │
  └───────────── Connection Established ─────────┘
```

---

## Database Schema

### ConnectionRequest Model

```javascript
{
  _id: ObjectId,
  fromUserId: ObjectId (ref: User),      // User sending the request
  toUserId: ObjectId (ref: User),        // User receiving the request
  status: String,                         // "interested", "ignored", "accepted", "rejected"
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Status Types:**
| Status | Description | Sent By | Receiver Action |
|--------|-------------|---------|-----------------|
| `interested` | User shows interest in connecting | Sender | Can accept/reject |
| `ignored` | User ignores the connection | Sender | No action needed |
| `accepted` | Connection is accepted | Receiver | Establishes connection |
| `rejected` | Connection is rejected | Receiver | Request closed |

---

## API Endpoints

### 1. Get All Users

**Endpoint:** `GET /api/users`

**Authentication:** Required (JWT Token)

**Description:** Retrieve all users except the current logged-in user

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "avatar_url",
      "createdAt": "2024-05-11T10:30:00Z"
    },
    {
      "_id": "user_id_2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "avatar": "avatar_url",
      "createdAt": "2024-05-11T11:00:00Z"
    }
  ]
}
```

---

### 2. Send Connection Request

**Endpoint:** `POST /api/request/send/:status/:toUserId`

**Authentication:** Required (JWT Token)

**Parameters:**
- `status` (URL param): `interested` or `ignored`
- `toUserId` (URL param): The ID of the user to send request to

**Description:** Send a connection request to another user

**Example Request:**
```bash
POST /api/request/send/interested/user_id_2
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Connection Request Sent Successfully",
  "data": {
    "_id": "request_id",
    "fromUserId": "current_user_id",
    "toUserId": "target_user_id",
    "status": "interested",
    "createdAt": "2024-05-11T12:00:00Z",
    "updatedAt": "2024-05-11T12:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Invalid Status Type"
}
```

**Error Response (400) - Connection Already Exists:**
```json
{
  "status": "error",
  "message": "Connection Already Exists"
}
```

**Error Response (404) - User Not Found:**
```json
{
  "status": "error",
  "message": "User Not Found"
}
```

---

### 3. Review Connection Request (Accept/Reject)

**Endpoint:** `POST /api/request/review/:status/:requestId`

**Authentication:** Required (JWT Token)

**Parameters:**
- `status` (URL param): `accepted` or `rejected`
- `requestId` (URL param): The ID of the connection request to review

**Description:** Accept or reject a connection request

**Example Request - Accept:**
```bash
POST /api/request/review/accepted/request_id_123
Authorization: Bearer <JWT_TOKEN>
```

**Example Request - Reject:**
```bash
POST /api/request/review/rejected/request_id_123
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Connection Request Reviewed Successfully",
  "data": {
    "_id": "request_id",
    "fromUserId": "user_who_sent_request",
    "toUserId": "current_user_id",
    "status": "accepted",
    "createdAt": "2024-05-11T12:00:00Z",
    "updatedAt": "2024-05-11T12:05:00Z"
  }
}
```

**Error Response (400) - Invalid Status:**
```json
{
  "status": "error",
  "message": "Status Not Allowed"
}
```

**Error Response (404) - Request Not Found:**
```json
{
  "status": "error",
  "message": "Connection Request Not Found"
}
```

---

## User Flow Diagram

### Complete User Interaction Flow

```
1. USER DISCOVERY
   └─> GET /api/users
       └─> List all available users

2. SEND CONNECTION REQUEST
   └─> POST /api/request/send/interested/:toUserId
       └─> Request sent with "interested" status

3. RECEIVER VIEWS REQUESTS
   └─> GET /api/request/requests (implied)
       └─> See incoming requests

4. REVIEW REQUEST
   ├─> POST /api/request/review/accepted/:requestId
   │   └─> Connection accepted (can now chat)
   │
   └─> POST /api/request/review/rejected/:requestId
       └─> Connection rejected (request closed)
```

---

## Validation Rules

### Connection Request Validations

1. **No Self-Requests**: A user cannot send a connection request to themselves
   ```
   Error: "cannot send request to yourself"
   ```

2. **No Duplicate Connections**: Cannot send multiple requests between the same two users
   ```
   Error: "Connection Already Exists"
   ```

3. **Receiver Must Exist**: Target user must exist in the database
   ```
   Error: "User Not Found"
   ```

4. **Status Validation**: Only allowed statuses are:
   - For sending: `interested`, `ignored`
   - For reviewing: `accepted`, `rejected`

5. **Receiver Can Only Review Own Requests**: A user can only accept/reject requests sent to them
   - The request must have status `interested` to be reviewable
   - The user reviewing must be the `toUserId`

---

## Implementation Details

### Controllers

**File:** `src/controllers/request.controller.js`

- `sendConnectionRequest()`: Handles sending new connection requests
- `reviewConnectionRequest()`: Handles accepting/rejecting requests

**File:** `src/controllers/user.controller.js`

- `getAllUsers()`: Retrieves all users except the current one

### Services

**File:** `src/services/request.service.js`

- `sendRequestService()`: Business logic for sending requests with validations
- `reviewRequestService()`: Business logic for reviewing requests with validations

### Models

**File:** `src/models/ConnectionRequest.model.js`

- Defines the ConnectionRequest schema with validation rules
- Includes pre-save hooks to prevent invalid requests
- Creates compound index on `fromUserId` and `toUserId` to avoid duplicates

### Routes

**File:** `src/routes/request.routes.js`

- All request routes are protected with authentication middleware
- POST `/send/:status/:toUserId` - Send connection request
- POST `/review/:status/:requestId` - Review connection request

---

## Example Workflow

### Step 1: User A discovers User B
```bash
GET /api/users
Response: List of all users including User B
```

### Step 2: User A sends "interested" request to User B
```bash
POST /api/request/send/interested/userB_id
Response: {
  "status": "success",
  "message": "Connection Request Sent Successfully",
  "data": { request object with status: "interested" }
}
```

### Step 3: User B reviews the request and accepts
```bash
POST /api/request/review/accepted/request_id
Response: {
  "status": "success",
  "message": "Connection Request Reviewed Successfully",
  "data": { request object with status: "accepted" }
}
```

### Result: Connection Established ✅
- User A and User B are now connected
- They can send/receive messages
- A chat or connection is created between them

---

## Error Handling

All endpoints follow consistent error handling:

```json
{
  "status": "error",
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200`: Request successful
- `201`: Resource created (new request sent)
- `400`: Bad request (invalid parameters or validation failed)
- `404`: Not found (user or request not found)
- `401`: Unauthorized (missing or invalid JWT token)
- `500`: Server error

---

## Security Considerations

1. **JWT Authentication**: All endpoints require valid JWT token
2. **User Isolation**: Users can only review requests sent to them
3. **Self-Request Prevention**: Cannot send requests to yourself
4. **Duplicate Prevention**: Indexed to prevent duplicate connections

---

## Future Enhancements

- [ ] Add notification system for new connection requests
- [ ] Add ability to view pending requests for a user
- [ ] Add ability to cancel sent requests
- [ ] Add friendship/connection status query
- [ ] Add bulk request operations
- [ ] Add request expiration (auto-reject after X days)

---

## Summary

This connection request system enables users to:
- ✅ **Follow** (Send interested request)
- ✅ **Accept** incoming connection requests
- ✅ **Reject** incoming connection requests
- ✅ **Ignore** potential connections

The system is secure, validated, and prevents duplicate or invalid connections.
