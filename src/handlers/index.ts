import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { roomHandlers } from "@/handlers/room";
import { Constructors, Async, Constructor } from "@/typings/misc";
import {
  AckCallback,
  ClientToServerEvents,
  ServerType,
  SocketType,
} from "@/typings/socket-io";
import { SongQuizException } from "@/exceptions";
import signale from "signale";
import { SongQuizExceptionCode } from "@/enums/exceptions";
import { ArgValidationError } from "@/typings/validation";
import { HandlerThis, Middleware } from "@/typings/handlers";
import { registerMiscHandlers } from "@/handlers/misc";
import { roundHandlers } from "@/handlers/round";

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

async function runMiddleware(middleware: Middleware[], socket: SocketType) {
  for (const middlewareFn of middleware) {
    const result = middlewareFn(socket);
    if (result instanceof Promise) await result;
  }
}

export function registerHandler<
  Ev extends keyof ClientToServerEvents,
  F extends ClientToServerEvents[Ev]
>(
  io: ServerType,
  socket: SocketType,
  event: Ev,
  handler: F | Async<F>,
  constructors: Constructors<Parameters<F>>,
  middleware: Middleware[]
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

      await runMiddleware(middleware, socket);

      const handlerThis: HandlerThis = { io, socket };
      const result = handler.call(handlerThis, ...argsTransformed) as
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

export function registerHandlers(io: ServerType, socket: SocketType) {
  const handlers = [...roomHandlers, ...roundHandlers];

  registerMiscHandlers(socket);
  for (const handler of handlers) {
    registerHandler(
      io,
      socket,
      handler.event,
      handler.handler,
      handler.constructors,
      handler.middleware ?? []
    );
  }
}
