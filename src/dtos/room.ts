import { RoomRoundsType, RoomStatus } from "@/enums/game";
import { Room, Player } from "@/models";
import { PlayerDto } from "@/dtos/player";
import { PlaylistDto } from "@/dtos/playlist";
import { RoundDto } from "@/dtos/round";

export class RoomDto {
  constructor(
    public code: string,
    public players: PlayerDto[],
    public leader: string,
    public status: RoomStatus,
    public roundsType: RoomRoundsType,
    public numberOfRounds: number,
    public secondsPerRound: number,
    public playlist: PlaylistDto | null,
    public currentRound: RoundDto | null = null
  ) {}

  static fromRoom(room: Room, player?: Player) {
    return new RoomDto(
      room.code,
      room.playersList.map((player) => PlayerDto.fromPlayer(player)),
      room.leader.nickname,
      room.status,
      room.roundsType,
      room.numberOfRounds,
      room.secondsPerRound,
      room.playlist ? PlaylistDto.fromPlaylist(room.playlist) : null,
      room.currentRound ? RoundDto.fromRound(room.currentRound, player) : null
    );
  }
}
