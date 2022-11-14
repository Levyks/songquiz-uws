import { createServer } from "@/server";
import { after, before } from "mocha";
import { SocketClientType } from "../typings/socket-io";

export function createServerBeforeAndStopAfter() {
  let stopServer: () => void;

  before(async () => {
    stopServer = (await createServer())[1];
  });

  after(() => {
    stopServer();
  });
}

export function disconnectAllSocketsAfterEach(sockets: SocketClientType[]) {
  afterEach(() => {
    sockets.forEach((socket) => socket.disconnect());
    sockets.length = 0;
  });
}
