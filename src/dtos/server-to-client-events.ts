import { RoomDto } from "@/dtos/room";
import { RoomRoundsType } from "@/enums/game";

export class RoomJoinedDto {
  constructor(public room: RoomDto, public token: string) {}
}

export class RoomSettingsChangedDto {
  roundsType: RoomRoundsType;
  numberOfRounds: number;
  secondsPerRound: number;
}
