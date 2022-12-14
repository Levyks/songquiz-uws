import { Server, Socket } from "socket.io";
import { SongQuizException } from "@/exceptions";
import {
  ChangeRoomPlaylistFromSpotifyDto,
  ChangeRoomSettingsDto,
  CreateRoomDto,
  GuessDto,
  JoinRoomDto,
} from "@/dtos/client-to-server-events";
import {
  RoomJoinedDto,
  RoomSettingsChangedDto,
  RoundEndedDto,
} from "@/dtos/server-to-client-events";
import { Player } from "@/models/player";
import { PlaylistDto } from "@/dtos/playlist";
import { RoundStartingDto } from "@/dtos/round";

export type AckCallback<D> = (
  result: [true, D] | [false, SongQuizException]
) => void;

export interface ServerToClientEvents {
  playerJoined: (nickname: string) => void;
  playerDisconnected: (nickname: string) => void;
  playerReconnected: (nickname: string) => void;
  playerLeft: (nickname: string) => void;
  roomSettingsChanged: (settings: RoomSettingsChangedDto) => void;
  roomPlaylistChanged: (playlist: PlaylistDto) => void;
  gameStarting: (delayInMs: number) => void;
  roundStarting: (data: RoundStartingDto) => void;
  roundStarted: () => void;
  roundEnded: (data: RoundEndedDto) => void;
  gameEnded: () => void;
  backToLobby: () => void;
}

export interface ClientToServerEvents {
  createRoom: (data: CreateRoomDto) => RoomJoinedDto;
  joinRoom: (data: JoinRoomDto) => RoomJoinedDto;
  leaveRoom: () => void;
  changeRoomSettings: (data: ChangeRoomSettingsDto) => void;
  changeRoomPlaylistFromSpotify: (
    data: ChangeRoomPlaylistFromSpotifyDto
  ) => void;
  startGame: () => void;
  backToLobby: () => void;
  guess: (data: GuessDto) => void;
}

export interface SocketData {
  player?: Player;
}

export type ServerToClientEventsUsable = {
  [key in keyof ServerToClientEvents]: (
    ...args: [
      ...Parameters<ServerToClientEvents[key]>,
      ...(ReturnType<ServerToClientEvents[key]> extends void
        ? []
        : [AckCallback<ReturnType<ServerToClientEvents[key]>>])
    ]
  ) => void;
};

export type ClientToServerEventsUsable = {
  [key in keyof ClientToServerEvents]: (
    ...args: [
      ...Parameters<ClientToServerEvents[key]>,
      ...(ReturnType<ClientToServerEvents[key]> extends void
        ? []
        : [AckCallback<ReturnType<ClientToServerEvents[key]>>])
    ]
  ) => void;
};

export type ServerType = Server<
  ClientToServerEventsUsable,
  ServerToClientEventsUsable,
  Record<string, never>,
  SocketData
>;

export type ChannelBroadcaster = ReturnType<ServerType["to"]>;

export type SocketType = Socket<
  ClientToServerEventsUsable,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;
