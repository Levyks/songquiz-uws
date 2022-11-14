import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { registerSocketClient, emit } from "./helpers/socket";
import { createRoom } from "./helpers/room";
import { generateRoomCode } from "@/services/rooms";
import { SongQuizExceptionCode } from "@/enums/exceptions";
import { SocketClientType } from "./typings/socket-io";
import {
  createServerBeforeAndStopAfter,
  disconnectAllSocketsAfterEach,
} from "./helpers/flow";
import { Player } from "@/models/player";
import { SongQuizException } from "@/exceptions";

chai.use(chaiAsPromised);

describe("Join Room", function () {
  const sockets: SocketClientType[] = [];

  createServerBeforeAndStopAfter();
  disconnectAllSocketsAfterEach(sockets);

  it("should join room", async () => {
    const leaderNickname = "leader";
    const leaderSocket = registerSocketClient(sockets);
    const roomCode = await createRoom(leaderSocket, leaderNickname);

    const playerNickname = "player";
    const playerSocket = registerSocketClient(sockets);
    const response = await emit(playerSocket, "joinRoom", {
      roomCode,
      nickname: playerNickname,
    });

    expect(response.token).to.be.a("string");

    expect(response.room.players).to.deep.include({
      nickname: playerNickname,
      score: 0,
      isOnline: true,
    });
  });

  it("shouldn't join a room that doesn't exist", async () => {
    const roomCode = generateRoomCode();
    if (!roomCode) throw new Error("Couldn't generate room code");

    const playerNickname = "player";
    const playerSocket = registerSocketClient(sockets);
    const joinPromise = emit(playerSocket, "joinRoom", {
      roomCode,
      nickname: playerNickname,
    });

    expect(joinPromise).to.be.rejectedWith(
      new SongQuizException(SongQuizExceptionCode.RoomDoesNotExist)
    );
  });

  it("should be able to reconnect with a token", async () => {
    const leaderNickname = "leader";
    const leaderSocket = registerSocketClient(sockets);
    const roomCode = await createRoom(leaderSocket, leaderNickname);

    const playerNickname = "player";
    const playerSocket = registerSocketClient(sockets);
    const token = await emit(playerSocket, "joinRoom", {
      roomCode,
      nickname: playerNickname,
    }).then((r) => r.token);

    playerSocket.disconnect();

    const playerSocket2 = registerSocketClient(sockets);
    const response = await emit(playerSocket2, "joinRoom", {
      roomCode,
      nickname: playerNickname,
      token,
    });

    expect(
      response.room.players.find((p) => p.nickname === playerNickname)?.isOnline
    ).to.be.true;
  });

  it("shouldn't be able to reconnect with an incorrect token", async () => {
    const leaderNickname = "leader";
    const leaderSocket = registerSocketClient(sockets);
    const roomCode = await createRoom(leaderSocket, leaderNickname);

    const playerNickname = "player";
    const playerSocket = registerSocketClient(sockets);
    const token = await emit(playerSocket, "joinRoom", {
      roomCode,
      nickname: playerNickname,
    }).then((r) => r.token);

    playerSocket.disconnect();

    let incorrectToken = token;
    while (incorrectToken === token) {
      incorrectToken = await Player.generateToken();
    }

    const playerSocket2 = registerSocketClient(sockets);
    const joinPromise = emit(playerSocket2, "joinRoom", {
      roomCode,
      nickname: playerNickname,
      token: incorrectToken,
    });

    expect(joinPromise).to.be.rejectedWith(
      new SongQuizException(SongQuizExceptionCode.NicknameAlreadyTaken)
    );
  });
});
