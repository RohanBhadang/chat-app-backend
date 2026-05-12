// /**
//  * Setup script to register test users and display their IDs
//  * Run this to get user IDs for client configuration
//  */

// const axios = require("axios");

// const API_BASE = "http://localhost:9000/api";

// const users = [
//   {
//     name: "Alice",
//     email: "alice@example.com",
//     password: "password123",
//   },
//   {
//     name: "Bob",
//     email: "bob@example.com",
//     password: "password123",
//   },
// ];

// async function setupUsers() {
//   try {
//     console.log("🔧 Setting up test users...\n");

//     for (const user of users) {
//       try {
//         const response = await axios.post(
//           `${API_BASE}/auth/register`,
//           user
//         );
//         console.log(`✅ ${user.name}`);
//         console.log(`   ID: ${response.data.user.id}`);
//         console.log(`   Email: ${user.email}\n`);
//       } catch (err) {
//         if (
//           err.response?.data?.message === "Email already registered"
//         ) {
//           // Try to login to get the ID
//           try {
//             const loginRes = await axios.post(
//               `${API_BASE}/auth/login`,
//               {
//                 email: user.email,
//                 password: user.password,
//               }
//             );
//             console.log(`✅ ${user.name} (existing user)`);
//             console.log(`   ID: ${loginRes.data.user.id}`);
//             console.log(`   Email: ${user.email}\n`);
//           } catch (loginErr) {
//             console.log(
//               `⚠️  ${user.name} exists but couldn't fetch ID\n`
//             );
//           }
//         } else {
//           console.error(
//             `❌ Error with ${user.name}:`,
//             err.message
//           );
//         }
//       }
//     }

//     console.log("✅ Done! Copy the IDs above.\n");
//     console.log("📝 Update client files:");
//     console.log("   tests/client1.js and tests/client2.js");
//     console.log("   Replace ALICE_ID with Alice's ID\n");
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//   }
// }

// setupUsers();
