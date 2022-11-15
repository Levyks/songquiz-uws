import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { emit, listenTo } from "./helpers/socket";
import {
  createPlayerAndCreateRoom,
  createPlayerAndJoinRoom,
} from "./helpers/room";
import { SocketClientType } from "./typings/socket-io";
import {
  createServerBeforeAndStopAfter,
  disconnectAllSocketsAfterEach,
} from "./helpers/flow";
import { RoomRoundsType } from "@/enums/game";
import { SongQuizException } from "@/exceptions";
import { SongQuizExceptionCode } from "@/enums/exceptions";

chai.use(chaiAsPromised);

describe("Room settings", () => {
  const sockets: SocketClientType[] = [];

  createServerBeforeAndStopAfter();
  disconnectAllSocketsAfterEach(sockets);

  it("leader should be able to change a room's settings and other players should be notified", async () => {
    const { roomCode, socket: leaderSocket } = await createPlayerAndCreateRoom(
      sockets
    );

    const { socket: playerSocket } = await createPlayerAndJoinRoom(
      sockets,
      roomCode
    );

    const newSettings = {
      roundsType: RoomRoundsType.Song,
      numberOfRounds: 10,
      secondsPerRound: 30,
    };

    const roomSettingsChangedListener = listenTo(
      playerSocket,
      "roomSettingsChanged"
    );

    await emit(leaderSocket, "changeRoomSettings", newSettings);

    expect(await roomSettingsChangedListener).to.be.deep.equal([newSettings]);
  });

  it("non-leader player shouldn't be able to change a room's settings", async () => {
    const { roomCode } = await createPlayerAndCreateRoom(sockets);

    const { socket: playerSocket } = await createPlayerAndJoinRoom(
      sockets,
      roomCode
    );

    const changeRoomSettingsPromise = emit(playerSocket, "changeRoomSettings", {
      roundsType: RoomRoundsType.Song,
      numberOfRounds: 10,
      secondsPerRound: 30,
    });

    expect(changeRoomSettingsPromise).to.be.rejectedWith(
      new SongQuizException(SongQuizExceptionCode.LeaderOnlyAction)
    );
  });
});
