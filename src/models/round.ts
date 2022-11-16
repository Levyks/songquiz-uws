import { Room } from "@/models/room";
import { RoomRoundsType, RoundStatus, RoundType } from "@/enums/game";
import { randomElement, randomNumber } from "@/helpers/misc";
import { TrackWithIndex } from "@/typings/playlist";
import { config } from "@/config";
import { Player } from "@/models/player";
import { SongQuizException } from "@/exceptions";
import { SongQuizExceptionCode } from "@/enums/exceptions";
import { RoundEndedDto } from "@/dtos/server-to-client-events";
import { Guess } from "@/typings/round";
import { RoundStartingDto } from "@/dtos/round";

export class Round {
  type: RoundType;
  durationInSeconds: number;
  choices: TrackWithIndex[];
  correctChoiceRelativeIndex: number;
  status: RoundStatus = RoundStatus.Waiting;

  guesses = new Map<Player, Guess>();
  startedAt: Date | null = null;
  scores: Record<string, number> | null = null;

  get choicesAsStrings(): string[] {
    switch (this.type) {
      case RoundType.Song:
        return this.choices.map((choice) => choice.track.name);
      case RoundType.Artist:
        return this.choices.map((choice) =>
          choice.track.artists.map((artist) => artist.name).join(", ")
        );
    }
  }

  get correctChoice(): TrackWithIndex {
    return this.choices[this.correctChoiceRelativeIndex];
  }

  get durationInMs(): number {
    return this.durationInSeconds * 1000;
  }

  get timeLeftInMs(): number {
    if (!this.startedAt) return this.durationInMs;
    const timePassed = new Date().getTime() - this.startedAt.getTime();
    return this.durationInMs - timePassed;
  }

  constructor(public number: number, public room: Room) {
    this.durationInSeconds = room.secondsPerRound;
    this.type = Round.getRandomTypeFromRoom(room);
    this.generateChoices();
    this.generateCorrectChoice();
  }

  public handlePlayerGuess(player: Player, choice: number) {
    if (this.status !== RoundStatus.InProgress)
      throw new SongQuizException(SongQuizExceptionCode.NotOpenForGuesses);

    this.guesses.set(player, {
      choice,
      timestamp: new Date(),
    });
  }

  public getPlayerGuess(player: Player): number | null {
    return this.guesses.get(player)?.choice ?? null;
  }

  private generateChoices() {
    if (!this.room.playlist)
      throw new Error(
        "Attempted to generate choices for a round of a room without a playlist"
      );
    this.choices = this.room.playlist.getRandomPlayableTracks(
      config.numberOfRoundChoices,
      this.type === RoundType.Artist
    );
  }

  private generateCorrectChoice() {
    if (process.env.NODE_ENV === "test") {
      this.correctChoiceRelativeIndex = this.number % this.choices.length;
      return;
    }
    this.correctChoiceRelativeIndex = randomNumber(0, this.choices.length - 1);
  }

  private getGuessScore(guess: Guess): number {
    if (!this.startedAt)
      throw new Error(
        "Attempted to get guess score of a round that hasn't started yet"
      );
    const timeTakenToGuess =
      guess.timestamp.getTime() - this.startedAt.getTime();
    const timeRemaining = this.durationInMs - timeTakenToGuess;

    return Math.round(
      (timeRemaining / this.durationInMs) * config.maxScoreBonus +
        config.baseScore
    );
  }

  public start() {
    this.status = RoundStatus.InProgress;
    this.startedAt = new Date();
    const realDuration = this.durationInMs + config.roundDurationSlackInMs;
    setTimeout(this.end.bind(this), realDuration);
    this.room.channel.emit("roundStarted");
  }

  public broadcastStarting() {
    this.room.channel.emit(
      "roundStarting",
      RoundStartingDto.fromRound(this, config.roundStartingBroadcastAdvanceInMs)
    );
  }

  public scheduleStart(delayInMs: number) {
    const delayBeforeBroadcastStartingInMs =
      delayInMs - config.roundStartingBroadcastAdvanceInMs;

    setTimeout(
      this.broadcastStarting.bind(this),
      delayBeforeBroadcastStartingInMs
    );
    setTimeout(this.start.bind(this), delayInMs);
  }

  private end() {
    this.status = RoundStatus.Ended;
    this.room.playlist?.setTrackAsPlayed(this.correctChoice);

    const correctGuessesWithScores = Array.from(this.guesses.entries())
      .filter(([, guess]) => guess.choice === this.correctChoiceRelativeIndex)
      .map(([player, guess]) => ({
        player,
        score: this.getGuessScore(guess),
      }));

    correctGuessesWithScores.forEach(({ player, score }) => {
      player.score += score;
    });

    this.scores = correctGuessesWithScores.reduce(
      (record, { player, score }) => {
        record[player.nickname] = score;
        return record;
      },
      {} as Record<string, number>
    );

    this.room.channel.emit("roundEnded", RoundEndedDto.fromRound(this));

    this.room.onRoundEnded(this);
  }

  static getRandomTypeFromRoom(room: Room): RoundType {
    switch (room.roundsType) {
      case RoomRoundsType.Both:
        return randomElement([RoundType.Song, RoundType.Artist]);
      case RoomRoundsType.Song:
        return RoundType.Song;
      case RoomRoundsType.Artist:
        return RoundType.Artist;
    }
  }
}
