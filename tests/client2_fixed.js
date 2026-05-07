/**
 * Client 2 - Bob
 * Communicates one-to-one with Alice
 */

const { io } = require("socket.io-client");
const axios = require("axios");
 
const API_BASE = "http://localhost:9000/api";
const ALICE_ID = "69fc1fc6acd0e7c12b07387f";
const BOB_ID = "69fc1fc6acd0e7c12b073880";

let accessToken;
let currentUser;
let chatId;
let socket;

async function initialize() {
  try {
    console.log("🔄 Client 2 (Bob) initializing...\n");

    // Step 1: Login Bob
    console.log("📝 Logging in as Bob...");
    const loginRes = await axios.post(
      `${API_BASE}/auth/login`,
      {
        email: "bob@example.com",
        password: "password123",
      }
    );

    currentUser = loginRes.data.user;
    accessToken = loginRes.data.accessToken;

    console.log(`✅ Logged in as: ${currentUser.name}`);
    console.log(`   User ID: ${currentUser.id}\n`);

    // Step 2: Create one-to-one chat with Alice
    console.log(`💬 Creating one-to-one chat with Alice...`);
    const chatRes = await axios.post(
      `${API_BASE}/chat/create-one-to-one`,
      { recipientId: ALICE_ID },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    chatId = chatRes.data.chatId;
    console.log(`✅ Chat created: ${chatId}\n`);

    connectSocket();
  } catch (err) {
    console.error(
      "❌ Error:",
      err.response?.data?.message || err.message
    );
  }
}

function connectSocket() {
  console.log("🔌 Connecting to socket...");

  socket = io("http://localhost:9000", {
    auth: {
      token: accessToken,
    },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected\n");

    // Join the chat room
    console.log(`📌 Joining chat room: ${chatId}`);
    socket.emit("join_chat", chatId);
    console.log(`⏳ Waiting for messages from Alice...\n`);
  });

  socket.on("receive_message", (msg) => {
    if (msg.senderId && msg.senderId._id !== currentUser.id) {
      console.log(`📩 ${msg.senderId.name}: "${msg.message}"`);
      console.log(
        `   ⏰ ${new Date(msg.createdAt).toLocaleTimeString()}\n`
      );

      // Auto-reply after 1 second
      setTimeout(() => {
        const reply =
          "Hi Alice! I'm doing great, thanks for asking! 😊";
        console.log(`💬 Bob: "${reply}"\n`);

        socket.emit("send_message", {
          chatId: chatId,
          message: reply,
        });
      }, 1000);
    }
  });

  socket.on("error", (err) => {
    console.error("❌ Socket error:", err);
  });

  socket.on("disconnect", () => {
    console.log("\n❌ Socket disconnected");
  });
}

initialize();
