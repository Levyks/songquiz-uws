import "reflect-metadata";
import { App, TemplatedApp, us_listen_socket_close } from "uWebSockets.js";
import { Server } from "socket.io";
import { ServerType } from "@/typings/socket-io";
import { registerHandlers } from "@/handlers";
import signale from "signale";
import { config } from "@/config";

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
