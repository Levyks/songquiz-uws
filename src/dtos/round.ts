import { RoundStatus, RoundType } from "@/enums/game";
import { Round, Player } from "@/models";

export class RoundDto {
  constructor(
    public number: number,
    public type: RoundType,
    public choices: string[],
    public correctChoiceTrackUrl: string,
    public status: RoundStatus,
    public timeLeftInMs: number,
    public youGuessed: number | false | null
  ) {}

  static fromRound(round: Round, player?: Player): RoundDto {
    return new RoundDto(
      round.number,
      round.type,
      round.choicesAsStrings,
      round.correctChoice.track.preview,
      round.status,
      round.timeLeftInMs,
      player ? round.getPlayerGuess(player) ?? false : null
    );
  }
}

export class RoundStartingDto {
  constructor(public round: RoundDto, public delayInMs: number) {}

  static fromRound(
    round: Round,
    delayInMs: number,
    player?: Player
  ): RoundStartingDto {
    return new RoundStartingDto(RoundDto.fromRound(round, player), delayInMs);
  }
}
