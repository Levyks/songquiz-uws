import { emit } from "./socket";
import { SocketClientType } from "../typings/socket-io";

export function createRoom(
  socket: SocketClientType,
  nickname = "leader"
): Promise<string> {
  return emit(socket, "createRoom", { nickname }).then(
    (response) => response.room.code
  );
}
