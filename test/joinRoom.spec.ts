import chai, { expect } from "chai";
import spies from "chai-spies";
import { createServer } from "@/server";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEventsUsable,
  ServerToClientEvents,
} from "@/typings/socket-io";
import { emit } from "./helpers/socket";
import { createRoom } from "./helpers/room";
import { generateRoomCode } from "@/services/rooms";
import { SongQuizExceptionCode } from "@/enums/exceptions";

chai.use(spies);

describe("Join Room", function () {
  const port = 3000;
  const leaderNickname = "levyks";

  let stopServer: () => void;
  let socket: Socket<ServerToClientEvents, ClientToServerEventsUsable>;

  before(async () => {
    stopServer = (await createServer(port))[1];
  });

  after(() => {
    stopServer();
  });

  beforeEach(async () => {
    socket = io(`http://localhost:${port}`);
  });

  afterEach(() => {
    socket.disconnect();
  });

  it("should join room", async () => {
    const nickname = "levyks";

    const roomCode = await createRoom(socket, leaderNickname);
    const response = await emit(socket, "joinRoom", { roomCode, nickname });

    const token = response.player.token;

    expect(token).to.be.a("string");

    expect(response.player).to.deep.equal({
      nickname,
      token,
      score: 0,
      isOnline: true,
    });

    expect(response.room.players).to.be.deep.include({
      nickname,
      score: 0,
      isOnline: true,
    });
  });

  it("shouldn't join a room that doesn't exist", async () => {
    const nickname = "player";

    const roomCode = generateRoomCode();
    if (!roomCode) throw new Error("Couldn't generate room code");

    const handleRejection = chai.spy();

    await emit(socket, "joinRoom", { roomCode, nickname }).catch(
      handleRejection
    );

    expect(handleRejection).to.have.been.called.once;
    expect(handleRejection).to.have.been.called.with.exactly({
      code: SongQuizExceptionCode.RoomDoesNotExist,
    });
  });
});
