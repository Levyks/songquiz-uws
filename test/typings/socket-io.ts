import { Socket } from "socket.io-client";
import {
  ClientToServerEventsUsable,
  ServerToClientEventsUsable,
} from "@/typings/socket-io";

export type SocketClientType = Socket<
  ServerToClientEventsUsable,
  ClientToServerEventsUsable
>;
