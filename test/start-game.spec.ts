import "./room-playlist.spec";
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
import { getRoom } from "@/services/rooms";
import { config } from "@/config";
import { RoomStatus } from "@/enums/game";
import { SongQuizException } from "@/exceptions";
import { SongQuizExceptionCode } from "@/enums/exceptions";

chai.use(chaiAsPromised);

describe("Start game", () => {
  const sockets: SocketClientType[] = [];
  const playlistId = "4kCm7RKVb6XjB65JTtJYzJ";

  createServerBeforeAndStopAfter();
  disconnectAllSocketsAfterEach(sockets);

  it("leader should be able to start game", async () => {
    const { roomCode, socket: leaderSocket } = await createPlayerAndCreateRoom(
      sockets
    );

    const room = getRoom(roomCode);
    if (!room) throw new Error("Room not found");

    await emit(leaderSocket, "changeRoomPlaylistFromSpotify", {
      playlistId,
    });

    expect(room.status).to.be.equal(RoomStatus.InLobby);
    expect(room.currentRound).to.be.null;

    await emit(leaderSocket, "startGame");

    expect(room.status).to.be.equal(RoomStatus.InGame);
    expect(room.currentRound).to.be.not.null;
  });

  it("other players should be notified when the game starts", async () => {
    const { roomCode, socket: leaderSocket } = await createPlayerAndCreateRoom(
      sockets
    );

    const { socket: playerSocket } = await createPlayerAndJoinRoom(
      sockets,
      roomCode
    );

    await emit(leaderSocket, "changeRoomPlaylistFromSpotify", {
      playlistId,
    });

    const gameStartingListener = listenTo(playerSocket, "gameStarting");

    await emit(leaderSocket, "startGame");

    expect(await gameStartingListener).to.be.deep.equal([
      config.delayBeforeStartingGameInMs,
    ]);
  });

  it("non-leader player shouldn't be able to start game", async () => {
    const { roomCode } = await createPlayerAndCreateRoom(sockets);

    const { socket: playerSocket } = await createPlayerAndJoinRoom(
      sockets,
      roomCode
    );

    const startGamePromise = emit(playerSocket, "startGame");

    expect(startGamePromise).to.be.rejectedWith(
      new SongQuizException(SongQuizExceptionCode.LeaderOnlyAction)
    );
  });

  it("leader shouldn't be able to start game without setting a playlist", async () => {
    const { socket: leaderSocket } = await createPlayerAndCreateRoom(sockets);

    const startGamePromise = emit(leaderSocket, "startGame");

    expect(startGamePromise).to.be.rejectedWith(
      new SongQuizException(SongQuizExceptionCode.RoomHasNoPlaylist)
    );
  });
});
