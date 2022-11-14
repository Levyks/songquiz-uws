import { Socket } from "socket.io-client";
import {
  ClientToServerEventsUsable,
  ServerToClientEvents,
} from "@/typings/socket-io";

export type SocketClientType = Socket<
  ServerToClientEvents,
  ClientToServerEventsUsable
>;
