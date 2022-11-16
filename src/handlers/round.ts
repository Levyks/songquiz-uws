import { GuessDto } from "@/dtos/client-to-server-events";
import { HandlerDefinition, HandlerThis } from "@/typings/handlers";
import {
  getCurrentRoundFromSocket,
  getPlayerFromSocket,
} from "@/helpers/socket";

function onGuess(this: HandlerThis, data: GuessDto): void {
  const player = getPlayerFromSocket(this.socket);
  const round = getCurrentRoundFromSocket(this.socket);
  round.handlePlayerGuess(player, data.choice);
}

export const roundHandlers: HandlerDefinition[] = [
  {
    event: "guess",
    handler: onGuess,
    constructors: [GuessDto],
  },
];
