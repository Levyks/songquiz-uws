import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { newSocketClient, emit } from "./helpers/socket";
import { SongQuizExceptionCode } from "@/enums/exceptions";
import { SocketClientType } from "./typings/socket-io";
import {
  createServerBeforeAndStopAfter,
  disconnectAllSocketsAfterEach,
} from "./helpers/flow";
import { SongQuizException } from "@/exceptions";
import {
  createPlayerAndCreateRoom,
  createPlayerAndJoinRoom,
} from "./helpers/room";

chai.use(chaiAsPromised);

describe("Leave Room", () => {
  const sockets: SocketClientType[] = [];

  createServerBeforeAndStopAfter();
  disconnectAllSocketsAfterEach(sockets);

  it("should be able to leave room", async () => {
    const { roomCode } = await createPlayerAndCreateRoom(sockets);

    const playerNickname = "player";
    const { socket: playerSocket } = await createPlayerAndJoinRoom(
      sockets,
      roomCode,
      playerNickname
    );

    await emit(playerSocket, "leaveRoom");
  });

  it("shouldn't be able to leave when not in a room", async () => {
    const socket = newSocketClient(sockets);
    const leavePromise = emit(socket, "leaveRoom");

    expect(leavePromise).to.be.rejectedWith(
      new SongQuizException(SongQuizExceptionCode.InRoomOnlyAction)
    );
  });
});
