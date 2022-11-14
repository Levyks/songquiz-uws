import { Player } from "@/models/player";
import { RoomStatus } from "@/enums/game";
import { SocketType } from "@/typings/socket-io";
import { SongQuizException } from "@/exceptions";
import { SongQuizExceptionCode } from "@/enums/exceptions";

export class Room {
  code: string;
  players = new Map<string, Player>();
  leader: Player;
  status = RoomStatus.InLobby;
  numberOfRounds = 10;
  secondsPerRound = 15;
  playlist: null;

  constructor(code: string, leaderNickname: string, socket: SocketType) {
    this.code = code;
    this.leader = new Player(leaderNickname, this, socket);
    socket.join(this.code);
    this.players.set(leaderNickname, this.leader);
  }

  async reconnectPlayer(
    player: Player,
    token: string | null,
    socket: SocketType
  ) {
    if (token !== (await player.token))
      throw new SongQuizException(SongQuizExceptionCode.NicknameAlreadyTaken);

    player.socket = socket;
    socket.join(this.code);
    return player;
  }

  async joinPlayer(nickname: string, token: string | null, socket: SocketType) {
    const alreadyExistentPlayer = this.players.get(nickname);
    if (alreadyExistentPlayer)
      return this.reconnectPlayer(alreadyExistentPlayer, token, socket);

    const player = new Player(nickname, this, socket);
    socket.join(this.code);
    this.players.set(nickname, player);
    return player;
  }
}
