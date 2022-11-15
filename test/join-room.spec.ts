import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { newSocketClient, emit } from "./helpers/socket";
import { generateRoomCode } from "@/services/rooms";
import { SongQuizExceptionCode } from "@/enums/exceptions";
import { SocketClientType } from "./typings/socket-io";
import {
  createServerBeforeAndStopAfter,
  disconnectAllSocketsAfterEach,
} from "./helpers/flow";
import { Player } from "@/models/player";
import { SongQuizException } from "@/exceptions";
import {
  createPlayerAndCreateRoom,
  createPlayerAndJoinRoom,
} from "./helpers/room";

chai.use(chaiAsPromised);

describe("Join Room", () => {
  const sockets: SocketClientType[] = [];

  createServerBeforeAndStopAfter();
  disconnectAllSocketsAfterEach(sockets);

  it("should join room", async () => {
    const { roomCode } = await createPlayerAndCreateRoom(sockets);

    const playerNickname = "player";
    const playerSocket = newSocketClient(sockets);
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

    const joinPromise = createPlayerAndJoinRoom(sockets, roomCode);

    expect(joinPromise).to.be.rejectedWith(
      new SongQuizException(SongQuizExceptionCode.RoomDoesNotExist)
    );
  });

  it("should be able to reconnect with a token", async () => {
    const { roomCode } = await createPlayerAndCreateRoom(sockets);

    const playerNickname = "player";

    const { socket: playerSocket, token } = await createPlayerAndJoinRoom(
      sockets,
      roomCode,
      playerNickname
    );

    playerSocket.disconnect();

    const playerSocket2 = newSocketClient(sockets);
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
    const { roomCode } = await createPlayerAndCreateRoom(sockets);

    const playerNickname = "player";
    const { socket: playerSocket, token } = await createPlayerAndJoinRoom(
      sockets,
      roomCode,
      playerNickname
    );

    playerSocket.disconnect();

    let incorrectToken = token;
    while (incorrectToken === token) {
      incorrectToken = await Player.generateToken();
    }

    const playerSocket2 = newSocketClient(sockets);
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
