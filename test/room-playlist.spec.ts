import "./spotify.spec";
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
import { SongQuizException } from "@/exceptions";
import { SongQuizExceptionCode } from "@/enums/exceptions";
import { fetchPlaylist as fetchSpotifyPlaylist } from "@/services/spotify";
import { PlaylistDto } from "@/dtos/playlist";
import { Playlist } from "@/models/playlist";
import { getRoom } from "@/services/rooms";

chai.use(chaiAsPromised);

describe("Room playlist", () => {
  const sockets: SocketClientType[] = [];
  const playlistId = "4kCm7RKVb6XjB65JTtJYzJ";
  let playlist: Playlist;

  before(async () => {
    playlist = await fetchSpotifyPlaylist(playlistId);
  });

  createServerBeforeAndStopAfter();
  disconnectAllSocketsAfterEach(sockets);

  it("leader should be able to set a room's playlist from Spotify", async () => {
    const { roomCode, socket: leaderSocket } = await createPlayerAndCreateRoom(
      sockets
    );

    const room = getRoom(roomCode);
    if (!room) throw new Error("Room not found");

    expect(room.playlist).to.be.null;

    await emit(leaderSocket, "changeRoomPlaylistFromSpotify", {
      playlistId,
    });

    expect(room.playlist).to.be.not.null;
    expect(room.playlist).to.have.property("id", playlistId);
  });

  it("other players should be notified when the playlist is changed", async () => {
    const { roomCode, socket: leaderSocket } = await createPlayerAndCreateRoom(
      sockets
    );

    const { socket: playerSocket } = await createPlayerAndJoinRoom(
      sockets,
      roomCode
    );

    const roomPlaylistChangedListener = listenTo(
      playerSocket,
      "roomPlaylistChanged"
    );

    await emit(leaderSocket, "changeRoomPlaylistFromSpotify", {
      playlistId,
    });

    expect(roomPlaylistChangedListener).to.be.fulfilled;
    expect(roomPlaylistChangedListener).to.become([
      PlaylistDto.fromPlaylist(playlist),
    ]);
  });

  it("non-leader player shouldn't be able to change a room's playlist", async () => {
    const { roomCode } = await createPlayerAndCreateRoom(sockets);

    const { socket: playerSocket } = await createPlayerAndJoinRoom(
      sockets,
      roomCode
    );

    const changeRoomPlaylistPromise = emit(
      playerSocket,
      "changeRoomPlaylistFromSpotify",
      {
        playlistId,
      }
    );

    expect(changeRoomPlaylistPromise).to.be.rejectedWith(
      new SongQuizException(SongQuizExceptionCode.LeaderOnlyAction)
    );
  });
});
