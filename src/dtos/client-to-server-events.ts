import { Length } from "class-validator";
import { config } from "@/config";

export class CreateRoomDto {
  @Length(config.minNicknameLength, config.maxNicknameLength)
  nickname: string;
}

export class JoinRoomDto {
  @Length(config.minNicknameLength, config.maxNicknameLength)
  nickname: string;
  @Length(config.roomCodeLength)
  roomCode: string;
  @Length(config.tokenStringLength)
  token: string;
}
