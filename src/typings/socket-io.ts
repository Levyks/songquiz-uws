import { Server, Socket } from "socket.io";
import { SongQuizException } from "@/exceptions";
import { CreateRoomDto, JoinRoomDto } from "@/dtos/client-to-server-events";
import { RoomJoinedDto } from "@/dtos/server-to-client-events";

export type AckCallback<D> = (
  result: [true, D] | [false, SongQuizException]
) => void;

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
  createRoom: (data: CreateRoomDto) => RoomJoinedDto;
  joinRoom: (data: JoinRoomDto) => RoomJoinedDto;
}

export interface SocketData {
  name: string;
  age: number;
}

export type ClientToServerEventsUsable = {
  [key in keyof ClientToServerEvents]: (
    ...args: [
      ...Parameters<ClientToServerEvents[key]>,
      AckCallback<ReturnType<ClientToServerEvents[key]>>
    ]
  ) => void;
};

export type ServerType = Server<
  ClientToServerEventsUsable,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

export type SocketType = Socket<
  ClientToServerEventsUsable,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;
