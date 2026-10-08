import "dotenv/config";
import http from "http";
import app from "./app";
import { setupWebSocket } from "./websocket/server";

const server = http.createServer(app);

// Initialize WebSocket server
setupWebSocket(server);

const PORT = process.env.PORT || 3200;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});