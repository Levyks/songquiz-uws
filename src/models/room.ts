import { Player } from "@/models/player";
import { RoomRoundsType, RoomStatus } from "@/enums/game";
import {
  ChannelBroadcaster,
  ServerType,
  SocketType,
} from "@/typings/socket-io";
import { ChangeRoomSettingsDto } from "@/dtos/client-to-server-events";
import { Playlist } from "@/models/playlist";
import { PlaylistDto } from "@/dtos/playlist";
import { Round } from "@/models/round";
import { config } from "@/config";
import { SongQuizException } from "@/exceptions";
import { SongQuizExceptionCode } from "@/enums/exceptions";

export class Room {
  //region Fields
  io: ServerType;
  channel: ChannelBroadcaster;
  code: string;
  players = new Map<string, Player>();
  leader: Player;
  status = RoomStatus.InLobby;
  roundsType = RoomRoundsType.Both;
  numberOfRounds = config.defaultRoundsPerGame;
  secondsPerRound = config.defaultSecondsPerRound;
  playlist: Playlist | null = null;
  currentRound: Round | null = null;
  //endregion

  //region Constructor
  constructor(
    io: ServerType,
    code: string,
    leaderNickname: string,
    leaderSocket: SocketType
  ) {
    this.io = io;
    this.code = code;
    this.channel = io.to(this.channelName);
    const leader = new Player(leaderNickname, this, leaderSocket);
    this.leader = leader;
    this.joinPlayer(leader);
  }
  //endregion

  //region Players map
  get playersList(): Player[] {
    return Array.from(this.players.values());
  }

  private getPlayer(nickname: string): Player | undefined {
    return this.players.get(nickname);
  }

  private setPlayer(player: Player): void {
    this.players.set(player.nickname, player);
  }
  //endregion

  //TODO: better name for this region
  //region Player joining/reconnecting/disconnecting/leaving
  public async tryJoinPlayer(
    nickname: string,
    token: string | undefined,
    socket: SocketType
  ): Promise<Player> {
    const alreadyExistentPlayer = this.getPlayer(nickname);

    if (alreadyExistentPlayer) {
      await alreadyExistentPlayer.tryReconnect(token, socket);
      return alreadyExistentPlayer;
    }

    const player = new Player(nickname, this, socket);
    return this.joinPlayer(player);
  }

  private joinPlayer(player: Player): Player {
    if (!player.socket)
      throw new Error("Attempted to join a player without a socket");
    this.setPlayer(player);
    this.joinChannel(player.socket);
    this.channelExcept(player).emit("playerJoined", player.nickname);
    return player;
  }

  public reconnectPlayer(player: Player): void {
    if (!player.socket)
      throw new Error("Attempted to reconnect a player without a socket");
    this.joinChannel(player.socket);
    this.channelExcept(player).emit("playerReconnected", player.nickname);
  }

  public leavePlayer(player: Player): void {
    this.players.delete(player.nickname);
    if (player.socket) this.leaveChannel(player.socket);
    this.channel.emit("playerLeft", player.nickname);
  }

  public onPlayerDisconnect(player: Player): void {
    this.channel.emit("playerDisconnected", player.nickname);
  }
  //endregion

  //region Settings
  public changeSettings(settings: ChangeRoomSettingsDto): void {
    this.roundsType = settings.roundsType;
    this.numberOfRounds = settings.numberOfRounds;
    this.secondsPerRound = settings.secondsPerRound;
    this.channel.emit("roomSettingsChanged", settings);
  }
  //endregion

  //region Playlist
  public changePlaylist(playlist: Playlist): void {
    this.playlist = playlist;
    this.channel.emit(
      "roomPlaylistChanged",
      PlaylistDto.fromPlaylist(playlist)
    );
  }
  //endregion

  //region Game
  public startGame() {
    if (this.status !== RoomStatus.InLobby)
      throw new SongQuizException(SongQuizExceptionCode.RoomIsNotInLobby);

    if (!this.playlist)
      throw new SongQuizException(SongQuizExceptionCode.RoomHasNoPlaylist);

    this.status = RoomStatus.InGame;
    this.currentRound = new Round(1, this);

    this.channel.emit("gameStarting", config.delayBeforeStartingGameInMs);

    this.currentRound.scheduleStart(config.delayBeforeStartingGameInMs);
  }

  public onRoundEnded(round: Round): void {
    /**
     * TODO: handle errors in methods called by setTimeout()
     */
    if (round !== this.currentRound)
      throw new Error("Attempted to end a round that is not the current round");
    if (round.number >= this.numberOfRounds) return this.endGame();

    this.currentRound = new Round(round.number + 1, this);
    this.currentRound.scheduleStart(config.intervalBetweenRoundsInMs);
  }

  private endGame() {
    this.status = RoomStatus.Results;
    this.currentRound = null;
    this.playersList.forEach((player) => (player.score = 0));
    this.channel.emit("gameEnded");
  }

  public backToLobby(): void {
    this.status = RoomStatus.InLobby;
    this.channel.emit("backToLobby");
  }
  //endregion

  //region Channel
  get channelName(): string {
    return `room-${this.code}`;
  }

  private channelExcept(player: Player): ChannelBroadcaster {
    if (!player.socket) return this.channel;
    return player.socket.to(this.channelName);
  }

  private joinChannel(socket: SocketType): void {
    socket.join(this.channelName);
  }

  private leaveChannel(socket: SocketType): void {
    socket.leave(this.channelName);
  }
  //endregion
}
