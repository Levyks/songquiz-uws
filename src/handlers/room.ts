import { createRoom, getRoom } from "@/services/rooms";
import {
  ChangeRoomPlaylistFromSpotifyDto,
  ChangeRoomSettingsDto,
  CreateRoomDto,
  JoinRoomDto,
} from "@/dtos/client-to-server-events";
import { RoomJoinedDto } from "@/dtos/server-to-client-events";
import { RoomDto } from "@/dtos/room";
import { SongQuizException } from "@/exceptions";
import { SongQuizExceptionCode } from "@/enums/exceptions";
import { HandlerDefinition, HandlerThis } from "@/typings/handlers";
import { getRoomFromSocket } from "@/helpers/socket";
import { isLeader } from "@/middleware/room";
import { fetchPlaylist as fetchSpotifyPlaylist } from "@/services/spotify";

async function onCreateRoom(
  this: HandlerThis,
  data: CreateRoomDto
): Promise<RoomJoinedDto> {
  const room = createRoom(this.io, data.nickname, this.socket);

  return new RoomJoinedDto(RoomDto.fromRoom(room), await room.leader.token);
}

async function onJoinRoom(
  this: HandlerThis,
  data: JoinRoomDto
): Promise<RoomJoinedDto> {
  const room = getRoom(data.roomCode);
  if (!room)
    throw new SongQuizException(SongQuizExceptionCode.RoomDoesNotExist);

  const player = await room.tryJoinPlayer(
    data.nickname,
    data.token,
    this.socket
  );

  return new RoomJoinedDto(RoomDto.fromRoom(room), await player.token);
}

function onChangeRoomSettings(
  this: HandlerThis,
  data: ChangeRoomSettingsDto
): void {
  const room = getRoomFromSocket(this.socket);
  room.changeSettings(data);
}

async function onChangeRoomPlaylistFromSpotify(
  this: HandlerThis,
  data: ChangeRoomPlaylistFromSpotifyDto
): Promise<void> {
  const room = getRoomFromSocket(this.socket);
  const playlist = await fetchSpotifyPlaylist(data.playlistId);
  room.changePlaylist(playlist);
}

export const roomHandlers: HandlerDefinition[] = [
  {
    event: "createRoom",
    handler: onCreateRoom,
    constructors: [CreateRoomDto],
  },
  {
    event: "joinRoom",
    handler: onJoinRoom,
    constructors: [JoinRoomDto],
  },
  {
    event: "changeRoomSettings",
    handler: onChangeRoomSettings,
    constructors: [ChangeRoomSettingsDto],
    middleware: [isLeader],
  },
  {
    event: "changeRoomPlaylistFromSpotify",
    handler: onChangeRoomPlaylistFromSpotify,
    constructors: [ChangeRoomPlaylistFromSpotifyDto],
    middleware: [isLeader],
  },
];
