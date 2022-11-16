import "reflect-metadata";
import { App, TemplatedApp, us_listen_socket_close } from "uWebSockets.js";
import { Server } from "socket.io";
import { ServerType } from "@/typings/socket-io";
import { registerHandlers } from "@/handlers";
import signale from "signale";
import { config } from "@/config";
import { getRoom } from "@/services/rooms";
import { RoomDto } from "@/dtos/room";

export function createServer(
  port = config.port
): Promise<[TemplatedApp, () => void]> {
  return new Promise((resolve, reject) => {
    const app = App();

    const io: ServerType = new Server({
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => registerHandlers(io, socket));

    io.attachApp(app);

    app.get("/room/:roomCode", (res, req) => {
      const room = getRoom(req.getParameter(0));
      if (!room) return res.writeStatus("404").end();
      res
        .writeHeader("Content-Type", "application/json")
        .end(JSON.stringify(RoomDto.fromRoom(room)));
    });

    app.listen(port, (token) => {
      if (!token) return reject("Port is already in use");
      signale.start(`Server is running on port ${port}`);
      const stop = () => {
        signale.complete("Server stopped");
        us_listen_socket_close(token);
      };
      resolve([app, stop]);
    });
  });
}
