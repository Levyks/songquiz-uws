import { SongQuizExceptionCode } from "@/enums/exceptions";

export class SongQuizException extends Error {
  static unknownError() {
    return new SongQuizException(SongQuizExceptionCode.UnknownError);
  }

  constructor(code: SongQuizExceptionCode, public data?: any) {
    super(code.toString());
  }

  toJSON() {
    return {
      code: this.message,
      data: this.data,
    };
  }
}
