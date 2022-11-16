export enum SongQuizExceptionCode {
  UnknownError = "UnknownError",
  InvalidArgumentCount = "InvalidArgumentCount",
  InvalidArguments = "InvalidArguments",

  CouldNotCreateRoom = "CouldNotCreateRoom",
  RoomDoesNotExist = "RoomDoesNotExist",
  NicknameAlreadyTaken = "NicknameAlreadyTaken",
  LeaderOnlyAction = "LeaderOnlyAction",
  InRoomOnlyAction = "InRoomOnlyAction",
  InRoundOnlyAction = "InRoundOnlyAction",
  NotOpenForGuesses = "NotOpenForGuesses",
  RoomIsNotInLobby = "RoomIsNotInLobby",
  RoomHasNoPlaylist = "RoomHasNoPlaylist",
}
