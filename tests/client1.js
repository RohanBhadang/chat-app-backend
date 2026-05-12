// /**
//  * Client 1 - Alice
//  * Communicates one-to-one with Bob
//  */

// const { io } = require("socket.io-client");
// const axios = require("axios");

// const API_BASE = "http://localhost:9000/api";
// const ALICE_ID = "69fc1fc6acd0e7c12b07387f";
// const BOB_ID = "69fc1fc6acd0e7c12b073880";

// let accessToken;
// let currentUser;
// let chatId;
// let socket;

// async function initialize() {
//   try {
//     console.log("🔄 Client 1 (Alice) initializing...\n");

//     // Step 1: Login Alice
//     console.log("📝 Logging in as Alice...");
//     const loginRes = await axios.post(
//       `${API_BASE}/auth/login`,
//       {
//         email: "alice@example.com",
//         password: "password123",
//       }
//     );

//     currentUser = loginRes.data.user;
//     accessToken = loginRes.data.accessToken;

//     console.log(`✅ Logged in as: ${currentUser.name}`);
//     console.log(`   User ID: ${currentUser.id}\n`);

//     // Step 2: Create one-to-one chat with Bob
//     console.log(`💬 Creating one-to-one chat with Bob...`);
//     const chatRes = await axios.post(
//       `${API_BASE}/chat/create-one-to-one`,
//       { recipientId: BOB_ID },
//       {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       }
//     );

//     chatId = chatRes.data.chatId;
//     console.log(`✅ Chat created: ${chatId}\n`);

//     connectSocket();
//   } catch (err) {
//     console.error(
//       "❌ Error:",
//       err.response?.data?.message || err.message
//     );
//   }
// }

// function connectSocket() {
//   console.log("🔌 Connecting to socket...");

//   socket = io("http://localhost:9000", {
//     auth: {
//       token: accessToken,
//     },
//   });

//   socket.on("connect", () => {
//     console.log("✅ Socket connected\n");

//     // Join the chat room
//     console.log(`📌 Joining chat room: ${chatId}`);
//     socket.emit("join_chat", chatId);

//     // Send message
//     setTimeout(() => {
//       const message = "Hello Bob! I'm Alice. How are you? 👋";
//       console.log(`\n💬 Alice: "${message}"\n`);

//       socket.emit("send_message", {
//         chatId: chatId,
//         message: message,
//       });
//     }, 500);
//   });

//   socket.on("receive_message", (msg) => {
//     if (msg.senderId && msg.senderId._id !== currentUser.id) {
//       console.log(`📩 ${msg.senderId.name}: "${msg.message}"`);
//       console.log(
//         `   ⏰ ${new Date(msg.createdAt).toLocaleTimeString()}\n`
//       );
//     }
//   });

//   socket.on("error", (err) => {
//     console.error("❌ Socket error:", err);
//   });

//   socket.on("disconnect", () => {
//     console.log("\n❌ Socket disconnected");
//   });
// }

// initialize();