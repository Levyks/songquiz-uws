import { registerHandler } from "@/handlers/index";
import { createRoom, getRoom } from "@/services/rooms";
import { CreateRoomDto, JoinRoomDto } from "@/dtos/client-to-server-events";
import { RoomJoinedDto } from "@/dtos/server-to-client-events";
import { RoomDto } from "@/dtos/room";
import { PlayerWithTokenDto } from "@/dtos/player";
import { SocketType } from "@/typings/socket-io";
import { SongQuizException } from "@/exceptions";
import { SongQuizExceptionCode } from "@/enums/exceptions";

async function onCreateRoom(
  this: SocketType,
  data: CreateRoomDto
): Promise<RoomJoinedDto> {
  const room = createRoom(data.nickname, this);

  return new RoomJoinedDto(
    RoomDto.fromRoom(room),
    await PlayerWithTokenDto.fromPlayer(room.leader)
  );
}

async function onJoinRoom(
  this: SocketType,
  data: JoinRoomDto
): Promise<RoomJoinedDto> {
  const room = getRoom(data.roomCode);
  if (!room)
    throw new SongQuizException(SongQuizExceptionCode.RoomDoesNotExist);

  const player = await room.joinPlayer(data.nickname, null, this);

  return new RoomJoinedDto(
    RoomDto.fromRoom(room),
    await PlayerWithTokenDto.fromPlayer(player)
  );
}

export function registerHandlers(socket: SocketType) {
  registerHandler(socket, "createRoom", onCreateRoom, [CreateRoomDto]);
  registerHandler(socket, "joinRoom", onJoinRoom, [JoinRoomDto]);
}
