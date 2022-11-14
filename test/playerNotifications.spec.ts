import chai, { expect } from "chai";
import spies from "chai-spies";
import { registerSocketClient, emit, listenTo } from "./helpers/socket";
import { createRoom } from "./helpers/room";
import { SocketClientType } from "./typings/socket-io";
import {
  createServerBeforeAndStopAfter,
  disconnectAllSocketsAfterEach,
} from "./helpers/flow";

chai.use(spies);

describe("Player notifications", function () {
  const sockets: SocketClientType[] = [];

  createServerBeforeAndStopAfter();
  disconnectAllSocketsAfterEach(sockets);

  it("should be notified when a player joins the room", async () => {
    const leaderNickname = "leader";
    const leaderSocket = registerSocketClient(sockets);
    const roomCode = await createRoom(leaderSocket, leaderNickname);

    const playerJoinedListener = listenTo(leaderSocket, "playerJoined");

    const playerNickname = "player";
    const playerSocket = registerSocketClient(sockets);
    await emit(playerSocket, "joinRoom", {
      roomCode,
      nickname: playerNickname,
    });

    expect(await playerJoinedListener).to.be.deep.equal([playerNickname]);
  });

  it("should be notified when a player disconnects", async () => {
    const leaderNickname = "leader";
    const leaderSocket = registerSocketClient(sockets);
    const roomCode = await createRoom(leaderSocket, leaderNickname);

    const playerNickname = "player";
    const playerSocket = registerSocketClient(sockets);
    await emit(playerSocket, "joinRoom", {
      roomCode,
      nickname: playerNickname,
    });

    const playerDisconnectedListener = listenTo(
      leaderSocket,
      "playerDisconnected"
    );

    playerSocket.disconnect();

    expect(await playerDisconnectedListener).to.be.deep.equal([playerNickname]);
  });

  it("should be notified when a player reconnects", async () => {
    const leaderNickname = "leader";
    const leaderSocket = registerSocketClient(sockets);
    const roomCode = await createRoom(leaderSocket, leaderNickname);

    const playerNickname = "player";
    const playerSocket = registerSocketClient(sockets);
    const token = await emit(playerSocket, "joinRoom", {
      roomCode,
      nickname: playerNickname,
    }).then((r) => r.token);

    const playerReconnectedListener = listenTo(
      leaderSocket,
      "playerReconnected"
    );

    playerSocket.disconnect();
    playerSocket.connect();

    await emit(playerSocket, "joinRoom", {
      roomCode,
      nickname: playerNickname,
      token,
    });

    expect(await playerReconnectedListener).to.be.deep.equal([playerNickname]);
  });
});
