import { io } from "socket.io-client";

// Eğer canlıda bir ortam değişkeni (Environment Variable) varsa onu kullan, yoksa local'e bağlan
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket"],
});