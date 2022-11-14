import chai, { expect } from "chai";
import spies from "chai-spies";
import { RoomStatus } from "@/enums/game";
import { registerSocketClient, emit } from "./helpers/socket";
import { SocketClientType } from "./typings/socket-io";
import {
  createServerBeforeAndStopAfter,
  disconnectAllSocketsAfterEach,
} from "./helpers/flow";

chai.use(spies);

describe("Create Room", function () {
  const sockets: SocketClientType[] = [];

  createServerBeforeAndStopAfter();
  disconnectAllSocketsAfterEach(sockets);

  it("should create room", async () => {
    const nickname = "levyks";

    const socket = registerSocketClient(sockets);
    const response = await emit(socket, "createRoom", { nickname });

    const roomCode = response.room.code;
    const token = response.token;

    expect(roomCode).to.be.a("string");
    expect(token).to.be.a("string");

    expect(response).to.be.deep.equal({
      room: {
        code: roomCode,
        players: [
          {
            nickname,
            score: 0,
            isOnline: true,
          },
        ],
        leader: nickname,
        status: RoomStatus.InLobby,
        numberOfRounds: 10,
        secondsPerRound: 15,
        playlist: null,
      },
      token,
    });
  });
});
