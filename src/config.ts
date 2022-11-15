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
  minSecondsPerRound: 5,
  maxSecondsPerRound: 30,
  maxNumberOfRoomCodeGenerationTries: 1000000000,
  spotifyTracksFetchLimit: 100,
  get tokenStringLength() {
    return Math.ceil((this.tokenSizeInBytes / 6) * 8);
  },
};
