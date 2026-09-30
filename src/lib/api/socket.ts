import { io, type Socket } from "socket.io-client";
import { CHAT_SOCKET_URL } from "./config";

let socket: Socket | null = null;
let socketToken: string | null = null;

/** Returns a shared socket for the given token, reconnecting if the token changed. */
export function getChatSocket(token: string): Socket {
  if (socket && socketToken === token) return socket;
  socket?.disconnect();
  socket = io(CHAT_SOCKET_URL, { auth: { token } });
  socketToken = token;
  return socket;
}

export function disconnectChatSocket() {
  socket?.disconnect();
  socket = null;
  socketToken = null;
}
