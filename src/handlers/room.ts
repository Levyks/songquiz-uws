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
import { getPlayerFromSocket, getRoomFromSocket } from "@/helpers/socket";
import { isLeader } from "@/middleware/room";
import { fetchPlaylist as fetchSpotifyPlaylist } from "@/services/spotify";
import signale from "signale";

async function onCreateRoom(
  this: HandlerThis,
  data: CreateRoomDto
): Promise<RoomJoinedDto> {
  const room = createRoom(this.io, data.nickname, this.socket);

  return new RoomJoinedDto(
    RoomDto.fromRoom(room, room.leader),
    await room.leader.token
  );
}

// TODO: implement player limit
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

  return new RoomJoinedDto(RoomDto.fromRoom(room, player), await player.token);
}

function onLeaveRoom(this: HandlerThis): void {
  const player = getPlayerFromSocket(this.socket);
  const room = getRoomFromSocket(this.socket);
  room.leavePlayer(player);

  // TODO: Are players being garbage collected after leaving? They should!!
  new FinalizationRegistry((nickname) => {
    signale.warn(`Player is being garbage collected: ${nickname}`);
  }).register(player, player.nickname);

  this.socket.data.player = undefined;
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

function onStartGame(this: HandlerThis): void {
  const room = getRoomFromSocket(this.socket);
  room.startGame();
}

function onBackToLobby(this: HandlerThis): void {
  const room = getRoomFromSocket(this.socket);
  room.backToLobby();
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
    event: "leaveRoom",
    handler: onLeaveRoom,
    constructors: [],
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
  {
    event: "startGame",
    handler: onStartGame,
    constructors: [],
    middleware: [isLeader],
  },
  {
    event: "backToLobby",
    handler: onBackToLobby,
    constructors: [],
    middleware: [isLeader],
  },
];
