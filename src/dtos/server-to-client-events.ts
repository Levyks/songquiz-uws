import { RoomDto } from "@/dtos/room";
import { PlayerWithTokenDto } from "@/dtos/player";

export class RoomJoinedDto {
  room: RoomDto;
  player: PlayerWithTokenDto;

  constructor(room: RoomDto, player: PlayerWithTokenDto) {
    this.room = room;
    this.player = player;
  }
}
