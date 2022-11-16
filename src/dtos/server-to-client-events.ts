import { RoomDto } from "@/dtos/room";
import { RoomRoundsType } from "@/enums/game";
import { TrackDto } from "@/dtos/playlist";
import { Round } from "@/models";

export class RoomJoinedDto {
  constructor(public room: RoomDto, public token: string) {}
}

export class RoomSettingsChangedDto {
  constructor(
    public roundsType: RoomRoundsType,
    public numberOfRounds: number,
    public secondsPerRound: number
  ) {}
}

export class RoundEndedDto {
  constructor(
    public round: number,
    public track: TrackDto,
    public correctChoiceRelativeIndex: number,
    public scores: Record<string, number>
  ) {}

  static fromRound(round: Round): RoundEndedDto {
    if (!round.scores) throw new Error("Round scores are not set");
    return new RoundEndedDto(
      round.number,
      TrackDto.fromTrack(round.correctChoice.track),
      round.correctChoiceRelativeIndex,
      round.scores
    );
  }
}
