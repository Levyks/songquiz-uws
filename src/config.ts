/**
 * TODO: sort this ting out
 */
export const config = {
  port: Number(process.env.PORT) || 3000,
  roomCodeLength: 4,
  minNicknameLength: 3,
  maxNicknameLength: 32,
  tokenSizeInBytes: 32,
  minRoundsPerGame: 1,
  maxRoundsPerGame: 20,
  defaultRoundsPerGame: 10,
  minSecondsPerRound: 5,
  maxSecondsPerRound: 30,
  defaultSecondsPerRound: 10,
  maxNumberOfRoomCodeGenerationTries: 1000000000,
  spotifyTracksFetchLimit: 100,
  numberOfRoundChoices: 4,
  baseScore: 150,
  maxScoreBonus: 150,
  delayBeforeStartingGameInMs: 3000,
  roundStartingBroadcastAdvanceInMs: 1000,
  roundDurationSlackInMs: 1000,
  intervalBetweenRoundsInMs: 1000,
  get tokenStringLength() {
    return Math.ceil((this.tokenSizeInBytes / 6) * 8);
  },
};
