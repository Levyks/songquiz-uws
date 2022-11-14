import { Player } from "@/models/player";

export class PlayerDto {
  nickname: string;
  score: number;
  isOnline: boolean;

  static fromPlayer(player: Player) {
    const dto = new PlayerDto();
    dto.nickname = player.nickname;
    dto.score = player.score;
    dto.isOnline = player.isOnline;
    return dto;
  }
}
