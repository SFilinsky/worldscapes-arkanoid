import {Player} from "@worldscapes-arkanoid/common";
import * as minimist from "minimist";

export interface ConsoleParams {
    player1: Player,
    player2: Player,
    port: number
}

export function params(): ConsoleParams {
    const args = minimist(process.argv.slice(2));

    if (!args.port || typeof(args.port) !== 'number') {
        throw Error("You should pass port number as [-port]");
    }

    if (!args.playerId1 || !args.playerId2 || !args.playerName1 || !args.playerName2) {
        throw Error("You should pass player info as [-playerId1] [-playerId2] [-playerName1] [-playerName2].");
    }

    if (typeof args.playerId1 !== 'string' || typeof args.playerId2 !== 'string') {
        throw Error("ID's you pass as player info should be strings.");
    }

    return {
        player1: { id: args.playerId1, name: args.playerName1 },
        player2: { id: args.playerId2, name: args.playerName2 },
        port: args.port,
    };
}
