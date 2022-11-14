import { SocketType } from "@/typings/socket-io";
import { SongQuizException } from "@/exceptions";
import { SongQuizExceptionCode } from "@/enums/exceptions";

export function isLeader(socket: SocketType) {
  if (!socket.data.player?.isLeader)
    throw new SongQuizException(SongQuizExceptionCode.LeaderOnlyAction);
}
