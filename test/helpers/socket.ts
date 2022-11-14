import {
  ClientToServerEvents,
  ClientToServerEventsUsable,
  ServerToClientEvents,
} from "@/typings/socket-io";
import { Socket } from "socket.io-client";
import { SongQuizException } from "@/exceptions";

export function emit<Ev extends keyof ClientToServerEvents>(
  socket: Socket<ServerToClientEvents, ClientToServerEventsUsable>,
  event: Ev,
  ...args: Parameters<ClientToServerEvents[Ev]>
): Promise<ReturnType<ClientToServerEvents[Ev]>> {
  return new Promise((resolve, reject) => {
    const argsWithCb = [
      ...args,
      (
        response:
          | [true, ReturnType<ClientToServerEvents[Ev]>]
          | [false, SongQuizException]
      ) => {
        if (response[0]) resolve(response[1]);
        else reject(response[1]);
      },
    ] as Parameters<ClientToServerEventsUsable[Ev]>;
    socket.emit(event, ...argsWithCb);
  });
}
