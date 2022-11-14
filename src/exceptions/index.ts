import { SongQuizExceptionCode } from "@/enums/exceptions";

export class SongQuizException extends Error {
  static unknownError() {
    return new SongQuizException(SongQuizExceptionCode.UnknownError);
  }

  constructor(public code: SongQuizExceptionCode, public data?: any) {
    super(`SongQuizException: ${code.toString()}`);
  }

  toJSON() {
    return {
      code: this.code,
      data: this.data,
    };
  }
}
