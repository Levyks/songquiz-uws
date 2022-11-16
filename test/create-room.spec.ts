import { expect } from "chai";
import { RoomStatus } from "@/enums/game";
import { newSocketClient, emit } from "./helpers/socket";
import { SocketClientType } from "./typings/socket-io";
import {
  createServerBeforeAndStopAfter,
  disconnectAllSocketsAfterEach,
} from "./helpers/flow";
import { config } from "@/config";

describe("Create Room", () => {
  const sockets: SocketClientType[] = [];

  createServerBeforeAndStopAfter();
  disconnectAllSocketsAfterEach(sockets);

  it("should create room", async () => {
    const nickname = "levyks";

    const socket = newSocketClient(sockets);
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
        roundsType: "Both",
        numberOfRounds: config.defaultRoundsPerGame,
        secondsPerRound: config.defaultSecondsPerRound,
        playlist: null,
        currentRound: null,
      },
      token,
    });
  });
});
