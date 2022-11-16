import {
  AckCallback,
  ClientToServerEvents,
  ServerToClientEvents,
  ServerToClientEventsUsable,
} from "@/typings/socket-io";
import { io } from "socket.io-client";
import { SocketClientType } from "../typings/socket-io";
import { config } from "@/config";

export function newSocketClient(
  sockets: SocketClientType[],
  port = config.port
): SocketClientType {
  const socket: SocketClientType = io(`http://localhost:${port}`);
  sockets.push(socket);
  return socket;
}

export function emit<
  Ev extends keyof ClientToServerEvents,
  F extends ClientToServerEvents[Ev]
>(
  socket: SocketClientType,
  event: Ev,
  ...args: Parameters<F>
): Promise<ReturnType<F>> {
  return new Promise((resolve, reject) => {
    const cb: AckCallback<ReturnType<F>> = ([success, data]) => {
      if (success) resolve(data);
      else reject(data);
    };
    socket.emit.call(socket, event, ...args, cb);
  });
}

export function listenTo<
  Ev extends keyof ServerToClientEvents,
  F extends ServerToClientEvents[Ev]
>(socket: SocketClientType, event: Ev, timeout = 1000): Promise<Parameters<F>> {
  return new Promise((resolve, reject) => {
    const listener = (...args: Parameters<ServerToClientEventsUsable[Ev]>) => {
      resolve(args);
      clear();
    };

    socket.on.call(socket, event, listener);

    const timeoutId = setTimeout(() => {
      reject(
        new Error(`Timeout of ${timeout}ms exceeded for event "${event}"`)
      );
      clear();
    }, timeout);

    const clear = () => {
      clearTimeout(timeoutId);
      socket.off(event, listener as any);
    };
  });
}
