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
import { RoundStatus } from "@/enums/game";

chai.use(chaiAsPromised);

describe("Game loop", () => {
  const leaderNickname = "leader";
  const player1Nickname = "player1";
  const player2Nickname = "player2";
  const sockets: SocketClientType[] = [];
  const playlistId = "4kCm7RKVb6XjB65JTtJYzJ";

  createServerBeforeAndStopAfter();
  disconnectAllSocketsAfterEach(sockets);

  // TODO: break this down into smaller tests
  // TODO 2: change configurations based on environment to make this go quicker
  it("game loop", async () => {
    const { roomCode, socket: leaderSocket } = await createPlayerAndCreateRoom(
      sockets,
      leaderNickname
    );

    const room = getRoom(roomCode);
    if (!room) throw new Error("Room not found");

    const { socket: player1Socket } = await createPlayerAndJoinRoom(
      sockets,
      roomCode,
      player1Nickname
    );

    const { socket: player2Socket } = await createPlayerAndJoinRoom(
      sockets,
      roomCode,
      player2Nickname
    );

    await emit(leaderSocket, "changeRoomPlaylistFromSpotify", {
      playlistId,
    });

    await emit(leaderSocket, "startGame");

    const [roundStarting] = await listenTo(
      player1Socket,
      "roundStarting",
      config.delayBeforeStartingGameInMs + 1000
    );

    expect(roundStarting.delayInMs).to.be.equal(
      config.roundStartingBroadcastAdvanceInMs
    );
    expect(roundStarting.round).to.have.property("number", 1);
    expect(roundStarting.round).to.have.property("status", RoundStatus.Waiting);

    await listenTo(
      leaderSocket,
      "roundStarted",
      config.roundStartingBroadcastAdvanceInMs + 1000
    );

    await emit(leaderSocket, "guess", { choice: 1 });

    await emit(player2Socket, "guess", { choice: 3 });

    await new Promise((resolve) =>
      setTimeout(resolve, config.defaultSecondsPerRound * 1000 - 1000)
    );

    await emit(player1Socket, "guess", { choice: 1 });

    const [roundEnded] = await listenTo(
      leaderSocket,
      "roundEnded",
      config.defaultSecondsPerRound * 1000 +
        config.roundDurationSlackInMs +
        1000
    );

    expect(roundEnded).to.have.property("round", 1);

    const scores = roundEnded.scores;
    const leaderScore = scores[leaderNickname];
    const player1Score = scores[player1Nickname];

    expect(leaderScore).to.be.greaterThan(player1Score);
    expect(scores).to.not.have.key(player2Nickname);
  }).timeout(60000);
});
