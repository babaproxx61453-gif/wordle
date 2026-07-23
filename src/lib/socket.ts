import { io } from "socket.io-client";

// Eğer VITE_BACKEND_URL tanımlıysa onu kullan, yoksa varsayılan olarak lokal adrese bağlan
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket"],
});