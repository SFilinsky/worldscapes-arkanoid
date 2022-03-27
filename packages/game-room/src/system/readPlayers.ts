import * as minimist from "minimist";

export interface Player {
    id: string
    name: string
}

export function readPlayers(): { player1: Player, player2: Player } {
    const args = minimist(process.argv.slice(2));

    if (!args.playerId1 || !args.playerId2 || !args.playerName1 || !args.playerName2) {
        throw Error("You should pass player info as [-playerId1] [-playerId2] [-playerName1] [-playerName2].");
    }

    return {
        player1: { id: args.playerId1, name: args.playerName1 },
        player2: { id: args.playerId2, name: args.playerName2 }
    };
}
