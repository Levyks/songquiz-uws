import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { registerHandlers as registerRoomHandlers } from "@/handlers/room";
import { Constructors, Async, Constructor } from "@/typings/misc";
import {
  AckCallback,
  ClientToServerEvents,
  SocketType,
} from "@/typings/socket-io";
import { SongQuizException } from "@/exceptions";
import signale from "signale";
import { SongQuizExceptionCode } from "@/enums/exceptions";
import { ArgValidationError } from "@/typings/validation";

function validateArgsCount(args: any[], count: number) {
  if (args.length !== count)
    throw new SongQuizException(SongQuizExceptionCode.InvalidArgumentCount);
}

async function validateArgs(args: any[], constructors: Constructor<any>[]) {
  const validationResult = await Promise.all(args.map((arg) => validate(arg)));

  const argsWithErrors = validationResult.reduce((acc, result, position) => {
    if (result.length > 0) {
      acc.push({
        position,
        name: constructors[position].name,
        errors: result,
      });
    }
    return acc;
  }, [] as ArgValidationError[]);

  if (argsWithErrors.length > 0)
    throw new SongQuizException(
      SongQuizExceptionCode.InvalidArguments,
      argsWithErrors
    );
}

export function registerHandler<
  Ev extends keyof ClientToServerEvents,
  F extends ClientToServerEvents[Ev]
>(
  socket: SocketType,
  event: Ev,
  handler: F | Async<F>,
  constructors: Constructors<Parameters<F>>
) {
  const listener = async (...args) => {
    signale.info(`Received ${event} event`);

    const callback: AckCallback<ReturnType<F>> | null =
      typeof args[args.length - 1] === "function" ? args.pop() : null;

    if (!callback) return;

    try {
      validateArgsCount(args, constructors.length);

      const argsTransformed = args.map((arg, i) => {
        return plainToInstance(constructors[i], arg);
      }) as Parameters<F>;

      await validateArgs(argsTransformed, constructors);

      const result = handler.call(socket, ...argsTransformed) as
        | ReturnType<F>
        | Promise<ReturnType<F>>;

      if (result instanceof Promise) return callback([true, await result]);
      return callback([true, result]);
    } catch (e) {
      if (e instanceof SongQuizException) return callback([false, e]);
      signale.error(e);
      return callback([false, SongQuizException.unknownError()]);
    }
  };

  socket.on(event, listener as any);
}

export function registerHandlers(socket: SocketType) {
  registerRoomHandlers(socket);
}
