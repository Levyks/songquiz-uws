import {
  ClientToServerEvents,
  ServerType,
  SocketType,
} from "@/typings/socket-io";
import { Async, Constructors } from "@/typings/misc";

export type HandlerThis = {
  io: ServerType;
  socket: SocketType;
};

export type Middleware = (socket: SocketType) => void | Promise<void>;

export type HandlerDefinition<
  Ev extends keyof ClientToServerEvents = keyof ClientToServerEvents,
  F extends ClientToServerEvents[Ev] = ClientToServerEvents[Ev]
> = {
  event: Ev;
  handler: F | Async<F>;
  constructors: Constructors<Parameters<F>>;
  middleware?: Middleware[];
};
