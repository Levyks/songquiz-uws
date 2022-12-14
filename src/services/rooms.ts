import { Room } from "@/models/room";
import { SongQuizException } from "@/exceptions";
import { SongQuizExceptionCode } from "@/enums/exceptions";
import { ServerType, SocketType } from "@/typings/socket-io";

const rooms = new Map<string, Room>();

export function getRoom(code: string) {
  return rooms.get(code);
}

export function createRoom(
  io: ServerType,
  leaderNickname: string,
  socket: SocketType
) {
  const code = generateRoomCode();

  if (!code)
    throw new SongQuizException(SongQuizExceptionCode.CouldNotCreateRoom);

  const room = new Room(io, code, leaderNickname, socket);
  rooms.set(code, room);

  return room;
}

export function generateRoomCode(length = 4, maxNumberOfTries = 1000000000) {
  if (process.env.NODE_ENV === "test")
    return rooms.size.toString().padStart(length, "0");

  const max = Math.pow(10, length);
  let tries = 0;

  do {
    const code = Math.floor(Math.random() * max)
      .toString()
      .padStart(length, "0");

    if (!rooms.has(code)) return code;
  } while (++tries < maxNumberOfTries);

  return undefined;
}
