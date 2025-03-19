import { io } from "socket.io-client";

// Initialize Socket.IO client
export const socket = io("http://127.0.0.1:5001", {
  autoConnect: false,
  reconnection: true,
});

// Handle connection events
socket.on("connect", () => {
  console.log("Connected to collaboration server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from collaboration server");
});

// Handle slide updates
socket.on("slide_update", (data) => {
  console.log("Received slide update:", data);
});

// Handle user presence
socket.on("user_joined", (userId) => {
  console.log("User joined:", userId);
});

socket.on("user_left", (userId) => {
  console.log("User left:", userId);
});

export const joinSession = (sessionId) => {
  socket.emit("join_session", { sessionId });
};

export const updateSlide = (sessionId, slideIndex, content) => {
  socket.emit("update_slide", { sessionId, slideIndex, content });
};
