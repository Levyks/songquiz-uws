import chai, { expect } from "chai";
import spies from "chai-spies";
import { io, Socket } from "socket.io-client";
import { createServer } from "@/server";
import { RoomStatus } from "@/enums/game";
import { config } from "@/config";
import { SongQuizExceptionCode } from "@/enums/exceptions";
import {
  ClientToServerEventsUsable,
  ServerToClientEvents,
} from "@/typings/socket-io";
import { emit } from "./helpers/socket";

chai.use(spies);

describe("Create Room", function () {
  const port = 3000;

  let stopServer: () => void;
  let socket: Socket<ServerToClientEvents, ClientToServerEventsUsable>;

  before(async () => {
    stopServer = (await createServer(port))[1];
  });

  after(() => {
    stopServer();
  });

  beforeEach(() => {
    socket = io(`http://localhost:${port}`);
  });

  afterEach(() => {
    socket.disconnect();
  });

  it("should create room", async () => {
    const nickname = "levyks";

    const response = await emit(socket, "createRoom", { nickname });

    const roomCode = response.room.code;
    const token = response.player.token;

    expect(roomCode).to.be.a("string");
    expect(token).to.be.a("string");

    expect(response).to.be.deep.equal({
      room: {
        code: roomCode,
        players: [
          {
            nickname,
            score: 0,
            isOnline: true,
          },
        ],
        leader: nickname,
        status: RoomStatus.InLobby,
        numberOfRounds: 10,
        secondsPerRound: 15,
        playlist: null,
      },
      player: {
        nickname,
        token,
        score: 0,
        isOnline: true,
      },
    });
  });

  it("shouldn't create room with a too short nickname", async () => {
    const nickname = "aa";

    const handleRejection = chai.spy();

    await emit(socket, "createRoom", { nickname }).catch(handleRejection);

    expect(handleRejection).to.have.been.called.once;
    expect(handleRejection).to.have.been.called.with.exactly({
      code: SongQuizExceptionCode.InvalidArguments,
      data: [
        {
          errors: [
            {
              children: [],
              constraints: {
                isLength: `nickname must be longer than or equal to ${config.minNicknameLength} characters`,
              },
              property: "nickname",
              target: {
                nickname,
              },
              value: nickname,
            },
          ],
          name: "CreateRoomDto",
          position: 0,
        },
      ],
    });
  });

  it("shouldn't create room with a too long nickname", async () => {
    const nickname = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    const handleRejection = chai.spy();

    await emit(socket, "createRoom", { nickname }).catch(handleRejection);

    expect(handleRejection).to.have.been.called.once;
    expect(handleRejection).to.have.been.called.with.exactly({
      code: SongQuizExceptionCode.InvalidArguments,
      data: [
        {
          errors: [
            {
              children: [],
              constraints: {
                isLength: `nickname must be shorter than or equal to ${config.maxNicknameLength} characters`,
              },
              property: "nickname",
              target: {
                nickname,
              },
              value: nickname,
            },
          ],
          name: "CreateRoomDto",
          position: 0,
        },
      ],
    });
  });
});
