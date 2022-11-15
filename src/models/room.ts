import { Player } from "@/models/player";
import { RoomRoundsType, RoomStatus } from "@/enums/game";
import {
  ChannelBroadcaster,
  ServerType,
  SocketType,
} from "@/typings/socket-io";
import { ChangeRoomSettingsDto } from "@/dtos/client-to-server-events";
import { Playlist } from "@/models/playlist";
import { PlaylistDTO } from "@/dtos/playlist";

export class Room {
  //region Fields
  io: ServerType;
  channel: ChannelBroadcaster;
  code: string;
  players = new Map<string, Player>();
  leader: Player;
  status = RoomStatus.InLobby;
  roundsType = RoomRoundsType.Both;
  numberOfRounds = 10;
  secondsPerRound = 15;
  playlist: Playlist | null = null;
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

  private joinSocket(socket: SocketType): void {
    socket.join(this.channelName);
  }

  private joinPlayer(player: Player): Player {
    if (!player.socket)
      throw new Error("Attempted to join a player without a socket");
    this.setPlayer(player);
    this.joinSocket(player.socket);
    this.channelExcept(player).emit("playerJoined", player.nickname);
    return player;
  }

  public reconnectPlayer(player: Player): void {
    if (!player.socket)
      throw new Error("Attempted to reconnect a player without a socket");
    this.joinSocket(player.socket);
    this.channelExcept(player).emit("playerReconnected", player.nickname);
  }

  public onPlayerDisconnect(player: Player): void {
    this.channelExcept(player).emit("playerDisconnected", player.nickname);
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

  public changePlaylist(playlist: Playlist): void {
    this.playlist = playlist;
    this.channel.emit(
      "roomPlaylistChanged",
      PlaylistDTO.fromPlaylist(playlist)
    );
  }

  //region Channel
  get channelName(): string {
    return `room-${this.code}`;
  }

  private channelExcept(player: Player): ChannelBroadcaster {
    if (!player.socket) return this.channel;
    return player.socket.to(this.channelName);
  }
  //endregion
}
