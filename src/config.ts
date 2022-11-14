export const config = {
  roomCodeLength: 4,
  minNicknameLength: 3,
  maxNicknameLength: 32,
  tokenSizeInBytes: 32,
  get tokenStringLength() {
    return Math.ceil((this.tokenSizeInBytes / 6) * 8);
  },
  maxNumberOfRoomCodeGenerationTries: 1000000000,
};
