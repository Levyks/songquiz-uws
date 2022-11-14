import { randomBytes } from "crypto";
import { promisify } from "util";
import { SocketType } from "@/typings/socket-io";
import { Room } from "@/models/room";
import { SongQuizException } from "@/exceptions";
import { SongQuizExceptionCode } from "@/enums/exceptions";

const randomBytesAsync = promisify(randomBytes);

export class Player {
  nickname: string;
  room: Room;
  token: Promise<string>;
  score = 0;

  private _socket?: SocketType;

  get socket() {
    return this._socket;
  }

  set socket(socket: SocketType | undefined) {
    /**
     * TODO: Handle this case, for example
     * when a user enters in another tab
     * of the browser, what should happen
     * to the "old" tab?
     */
    if (this.socket) this.socket.data.player = undefined;
    this._socket = socket;
    if (socket) socket.data.player = this;
  }

  get isOnline() {
    return !!this.socket?.connected;
  }

  constructor(nickname: string, room: Room, socket: SocketType) {
    this.nickname = nickname;
    this.room = room;
    this.socket = socket;
    this.token = Player.generateToken();
  }

  async tryReconnect(token: string | undefined, socket: SocketType) {
    if (token !== (await this.token))
      throw new SongQuizException(SongQuizExceptionCode.NicknameAlreadyTaken);

    this.onReconnect(socket);
  }

  //region Connection events
  onReconnect(socket: SocketType) {
    this.socket = socket;
    this.room.reconnectPlayer(this);
  }

  onDisconnect() {
    this.socket = undefined;
    this.room.onPlayerDisconnect(this);
  }
  //endregion

  static async generateToken(sizeInBytes = 64) {
    const buffer = await randomBytesAsync(sizeInBytes);
    return buffer.toString("base64url");
  }
}
