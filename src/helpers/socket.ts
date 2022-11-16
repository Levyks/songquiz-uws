import { SocketType } from "@/typings/socket-io";
import { SongQuizExceptionCode } from "@/enums/exceptions";
import { SongQuizException } from "@/exceptions";
import { Room } from "@/models/room";
import { Player } from "@/models/player";
import { Round } from "@/models";

export function getPlayerFromSocket(socket: SocketType): Player {
  if (!socket.data.player)
    throw new SongQuizException(SongQuizExceptionCode.InRoomOnlyAction);
  return socket.data.player;
}

export function getRoomFromSocket(socket: SocketType): Room {
  return getPlayerFromSocket(socket).room;
}

export function getCurrentRoundFromSocket(socket: SocketType): Round {
  const currentRound = getRoomFromSocket(socket).currentRound;
  if (!currentRound)
    throw new SongQuizException(SongQuizExceptionCode.InRoundOnlyAction);
  return currentRound;
}
