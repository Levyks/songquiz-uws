import { randomBytes } from "crypto";
import { promisify } from "util";
import { SocketType } from "@/typings/socket-io";
import { Room } from "@/models/room";

const randomBytesAsync = promisify(randomBytes);

export class Player {
  token: Promise<string>;
  socket?: SocketType;
  score = 0;

  get isOnline() {
    return !!this.socket?.connected;
  }

  constructor(public nickname: string, public room: Room, socket: SocketType) {
    this.socket = socket;
    this.token = Player.generateToken();
  }

  static async generateToken(sizeInBytes = 64) {
    const buffer = await randomBytesAsync(sizeInBytes);
    return buffer.toString("base64url");
  }
}
