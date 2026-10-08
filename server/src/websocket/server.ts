import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import jwt from "jsonwebtoken";
import prisma from "../core/db";
import { rooms, documentStates, ClientObj } from "./store";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const DOCUMENT_SAVE_DEBOUNCE_MS = 750;
const documentSaveTimers = new Map<string, ReturnType<typeof setTimeout>>();

const persistDocument = async (roomId: string, content: string) => {
  try {
    await prisma.document.update({
      where: { id: roomId },
      data: { content },
    });
  } catch (error) {
    console.error(`Failed to persist document ${roomId}`, error);
  }
};

const scheduleDocumentPersistence = (roomId: string, content: string) => {
  const existingTimer = documentSaveTimers.get(roomId);
  if (existingTimer) clearTimeout(existingTimer);

  const timer = setTimeout(() => {
    documentSaveTimers.delete(roomId);
    void persistDocument(roomId, content);
  }, DOCUMENT_SAVE_DEBOUNCE_MS);

  documentSaveTimers.set(roomId, timer);
};

export const setupWebSocket = (server: http.Server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (socket, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const roomId = url.searchParams.get("room");
    
    let token = "";
    const cookiesHeader = req.headers.cookie;
    if (cookiesHeader) {
      const cookies = cookiesHeader.split(';').reduce((res: Record<string, string>, item) => {
        const data = item.trim().split('=');
        if (data.length === 2) {
           res[data[0]] = data[1];
        }
        return res;
      }, {});
      token = cookies.token || "";
    }

    if (!roomId || !token) {
      socket.close(1008, "Missing room or token");
      return;
    }

    let userId: string;
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = payload.userId;
    } catch {
      socket.close(1008, "Invalid token");
      return;
    }

    // Check permissions
    const doc = await prisma.document.findUnique({
      where: { id: roomId },
      include: { shares: { where: { userId } } }
    });

    const joiningUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!doc || !joiningUser) {
      socket.close(1008, "Document or User not found");
      return;
    }

    let role = "VIEWER";
    if (doc.ownerId === userId) {
      role = "OWNER";
    } else if (doc.shares.length > 0) {
      role = doc.shares[0].role;
    } else {
      socket.close(1008, "No permission");
      return;
    }

    console.log(`User ${userId} joined ${roomId} as ${role}`);

    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    const clientObj: ClientObj = { socket, role, user: { id: joiningUser.id, name: joiningUser.name, email: joiningUser.email } };
    const room = rooms.get(roomId)!;
    room.forEach((client) => {
      if (client.user.id === userId) {
        client.socket.close(1000, "Replaced by a newer connection");
        room.delete(client);
      }
    });
    room.add(clientObj);

    const broadcastActiveUsers = () => {
      const activeUsers = Array.from(room).map(c => ({ id: c.user.id, name: c.user.name, email: c.user.email, role: c.role }));
      const msg = JSON.stringify({ type: "active_users_update", activeUsers });
      room.forEach(c => {
        if (c.socket.readyState === WebSocket.OPEN) {
          c.socket.send(msg);
        }
      });
    };

    const currentState = documentStates.get(roomId) || doc.content;
    socket.send(JSON.stringify({ type: "init", role, content: currentState }));
    broadcastActiveUsers();

    socket.on("message", async (data) => {
      if (role === "VIEWER") {
         return;
      }

      const message = data.toString();
      try {
        const parsed = JSON.parse(message);
        if (parsed.type === "document_update") {
          const docContentStr = JSON.stringify(parsed.content);
          documentStates.set(roomId, docContentStr);
          const roomClients = rooms.get(roomId);
          if (roomClients) {
            roomClients.forEach((client) => {
              if (client.socket !== socket && client.socket.readyState === WebSocket.OPEN) {
                client.socket.send(message);
              }
            });
          }
          scheduleDocumentPersistence(roomId, docContentStr);
        }
      } catch {
        console.warn(`Ignoring invalid WebSocket message from user ${userId}`);
      }
    });

    socket.on("close", () => {
      const roomClients = rooms.get(roomId);
      if (roomClients) {
        roomClients.delete(clientObj);
        if (roomClients.size === 0) {
          const pendingTimer = documentSaveTimers.get(roomId);
          if (pendingTimer) {
            clearTimeout(pendingTimer);
            documentSaveTimers.delete(roomId);
            const latestContent = documentStates.get(roomId);
            if (latestContent) void persistDocument(roomId, latestContent);
          }
          rooms.delete(roomId);
          documentStates.delete(roomId);
        } else {
          const activeUsers = Array.from(roomClients).map(c => ({ id: c.user.id, name: c.user.name, email: c.user.email, role: c.role }));
          const msg = JSON.stringify({ type: "active_users_update", activeUsers });
          roomClients.forEach(c => {
            if (c.socket.readyState === WebSocket.OPEN) {
              c.socket.send(msg);
            }
          });
        }
      }
    });
  });
};
