import { RoomRoundsType, RoomStatus } from "@/enums/game";
import { Room } from "@/models/room";
import { PlayerDto } from "@/dtos/player";

export class RoomDto {
  code: string;
  players: PlayerDto[];
  leader: string;
  status: RoomStatus;
  roundsType: RoomRoundsType;
  numberOfRounds: number;
  secondsPerRound: number;
  playlist: null;

  static fromRoom(room: Room) {
    const dto = new RoomDto();
    dto.code = room.code;
    dto.players = room.playersList.map((player) =>
      PlayerDto.fromPlayer(player)
    );
    dto.leader = room.leader.nickname;
    dto.status = room.status;
    dto.roundsType = room.roundsType;
    dto.numberOfRounds = room.numberOfRounds;
    dto.secondsPerRound = room.secondsPerRound;
    dto.playlist = null;
    return dto;
  }
}
