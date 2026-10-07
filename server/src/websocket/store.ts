import { WebSocket } from "ws";

export interface ActiveUser {
  id: string;
  name: string | null;
  email: string;
}

export interface ClientObj {
  socket: WebSocket;
  role: string;
  user: ActiveUser;
}

export const rooms = new Map<string, Set<ClientObj>>();
export const documentStates = new Map<string, string>();
