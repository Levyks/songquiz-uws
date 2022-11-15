import { Length, IsOptional, IsEnum, IsInt, Max, Min } from "class-validator";
import { config } from "@/config";
import { RoomRoundsType } from "@/enums/game";

export class CreateRoomDto {
  @Length(config.minNicknameLength, config.maxNicknameLength)
  nickname: string;
}

export class JoinRoomDto {
  @Length(config.minNicknameLength, config.maxNicknameLength)
  nickname: string;
  @Length(config.roomCodeLength)
  roomCode: string;
  @IsOptional()
  @Length(config.tokenStringLength)
  token?: string;
}

export class ChangeRoomSettingsDto {
  @IsEnum(RoomRoundsType)
  roundsType: RoomRoundsType;

  @IsInt()
  @Min(config.minRoundsPerGame)
  @Max(config.maxRoundsPerGame)
  numberOfRounds: number;

  @IsInt()
  @Min(config.minSecondsPerRound)
  @Max(config.maxSecondsPerRound)
  secondsPerRound: number;
}

export class ChangeRoomPlaylistFromSpotifyDto {
  @Length(22)
  playlistId: string;
}
