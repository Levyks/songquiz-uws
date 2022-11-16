import { expect } from "chai";
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

describe("Players states", () => {
  const sockets: SocketClientType[] = [];

  createServerBeforeAndStopAfter();
  disconnectAllSocketsAfterEach(sockets);

  it("other players should be notified when a player joins the room", async () => {
    const { roomCode, socket: leaderSocket } = await createPlayerAndCreateRoom(
      sockets
    );

    const playerJoinedListener = listenTo(leaderSocket, "playerJoined");

    const playerNickname = "player";
    await createPlayerAndJoinRoom(sockets, roomCode, playerNickname);

    expect(await playerJoinedListener).to.be.deep.equal([playerNickname]);
  });

  it("other players should be notified when a player disconnects", async () => {
    const { roomCode, socket: leaderSocket } = await createPlayerAndCreateRoom(
      sockets
    );

    const playerNickname = "player";
    const { socket: playerSocket } = await createPlayerAndJoinRoom(
      sockets,
      roomCode,
      playerNickname
    );

    const playerDisconnectedListener = listenTo(
      leaderSocket,
      "playerDisconnected"
    );

    playerSocket.disconnect();

    expect(await playerDisconnectedListener).to.be.deep.equal([playerNickname]);
  });

  it("other players should be notified when a player reconnects", async () => {
    const { roomCode, socket: leaderSocket } = await createPlayerAndCreateRoom(
      sockets
    );

    const playerNickname = "player";
    const { socket: playerSocket, token } = await createPlayerAndJoinRoom(
      sockets,
      roomCode,
      playerNickname
    );

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

  it("other players should be notified when a player leaves", async () => {
    const { roomCode, socket: leaderSocket } = await createPlayerAndCreateRoom(
      sockets
    );

    const playerNickname = "player";
    const { socket: playerSocket } = await createPlayerAndJoinRoom(
      sockets,
      roomCode,
      playerNickname
    );

    const playerLeftListener = listenTo(leaderSocket, "playerLeft");

    await emit(playerSocket, "leaveRoom");

    expect(await playerLeftListener).to.be.deep.equal([playerNickname]);
  });
});
