import { emit, newSocketClient } from "./socket";
import { SocketClientType } from "../typings/socket-io";

export async function createPlayerAndCreateRoom(
  sockets: SocketClientType[],
  nickname = "leader"
): Promise<{ socket: SocketClientType; roomCode: string; token: string }> {
  const socket = newSocketClient(sockets);
  const response = await emit(socket, "createRoom", { nickname });
  return { socket, token: response.token, roomCode: response.room.code };
}

export async function createPlayerAndJoinRoom(
  sockets: SocketClientType[],
  roomCode: string,
  nickname = "player"
): Promise<{ socket: SocketClientType; token: string }> {
  const socket = newSocketClient(sockets);
  const token = await emit(socket, "joinRoom", {
    roomCode,
    nickname,
  }).then((response) => response.token);
  return { socket, token };
}
