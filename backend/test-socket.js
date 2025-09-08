import { io } from "socket.io-client";

const socket = io("http://localhost:5001");

socket.on("connect", () => {
  console.log("✅ Connected", socket.id);

  // rejoindre une conversation
  socket.emit("joinConversation", "d95fb290-81f9-4661-a26e-637d1da25c8d");

  // envoyer un message
  socket.emit("sendMessage", {
    convId: "d95fb290-81f9-4661-a26e-637d1da25c8d",
    senderId: "user-1",
    content: "Hello depuis test-socket.js 🚀",
  });
});

socket.on("newMessage", (msg) => {
  console.log("📩 Nouveau message:", msg);
});
