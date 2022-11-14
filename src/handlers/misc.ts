import { SocketType } from "@/typings/socket-io";

export function registerMiscHandlers(socket: SocketType) {
  socket.on("disconnect", () => {
    const player = socket.data.player;
    if (player) player.onDisconnect();
  });
}
