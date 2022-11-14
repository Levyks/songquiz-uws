import {
  ClientToServerEvents,
  ClientToServerEventsUsable,
  ServerToClientEvents,
  ServerToClientEventsUsable,
} from "@/typings/socket-io";
import { io, Socket } from "socket.io-client";
import { SongQuizException } from "@/exceptions";
import { SocketClientType } from "../typings/socket-io";
import { config } from "@/config";

export function registerSocketClient(
  sockets: SocketClientType[],
  port = config.port
): SocketClientType {
  const socket: SocketClientType = io(`http://localhost:${port}`);
  sockets.push(socket);
  return socket;
}

// TODO: fix this mess
export function emit<Ev extends keyof ClientToServerEvents>(
  socket: Socket<ServerToClientEventsUsable, ClientToServerEventsUsable>,
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
    ] as unknown as Parameters<ClientToServerEventsUsable[Ev]>;
    socket.emit(event, ...argsWithCb);
  });
}

export function listenTo<Ev extends keyof ServerToClientEventsUsable>(
  socket: Socket<ServerToClientEventsUsable, ClientToServerEventsUsable>,
  event: Ev,
  timeout = 1000
): Promise<Parameters<ServerToClientEvents[Ev]>> {
  return new Promise((resolve, reject) => {
    const off = () => {
      clearTimeout(timeoutId);
      socket.off(event, listener as any);
    };
    const listener = (...args: Parameters<ServerToClientEventsUsable[Ev]>) => {
      resolve(args);
      off();
    };
    socket.on(event, listener as any);
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout of ${timeout}ms exceeded`));
      off();
    }, timeout);
  });
}
