import { ECRRule, PlayerInfo, SimpleEcr } from "@worldscapes/common";
import {
    SimpleEngineServer,
    SimpleNetworkServer,
    SimpleServerAuth,
    SimpleServerSimulation,
    WebsocketServerNetworkAdapter
} from "@worldscapes/server";
import {GameSettings, MatterSerializer} from "@worldscapes-arkanoid/common";

import { commandInitializer } from "./setup/initializers/command.initializer";
import { ruleInitializer } from "./setup/initializers/rule.initializer";
import {ConsoleParams, params } from "./setup/cli/params";


const gameRoomSettings: ConsoleParams = params();

const players: PlayerInfo[] = [
    gameRoomSettings.player1,
    gameRoomSettings.player2
];

const DEFAULT_GAME_SETTINGS: GameSettings = {
    initialPoints: 5,

    gameRoomWidth: 1000,
    gameRoomHeight: 1000,

    platformWidth: 120,
    platformHeight: 20,
    platformGapFromBorder: 25,
    platformDensity: 10000,
    platformFriction: 0.01,
    platformRestitution: 1.1, //1.05,

    ballRadius: 14,
    ballDensity: 0.001,
    ballRestitution: 1.21, //1.22,
    ballInitialForce: 10 * 0.001,
};

const commands = commandInitializer(gameRoomSettings, DEFAULT_GAME_SETTINGS);
const rules = ruleInitializer(gameRoomSettings, DEFAULT_GAME_SETTINGS);

(async function init() {
    console.log("Initializing Engine.");

    console.log("Setting up network server.");
    const serverAdapter = new WebsocketServerNetworkAdapter(
        new SimpleServerAuth(players),
        50001
    );
    await serverAdapter.isReady();
    console.log("Network server is up.");

    console.log("Creating simulation instance");
    const ecr = new SimpleEcr();

    ecr.injectCommands(commands);
    rules.forEach(rule => ecr.addRule(rule as unknown as ECRRule));

    console.log("Creating Engine Server.");
    const server = new SimpleEngineServer(
        new SimpleServerSimulation(ecr, players),
        new SimpleNetworkServer(
            serverAdapter,
            new MatterSerializer(),
        ),
        { simulationTickInterval: 24 }
    );

    console.log("Starting Engine Server.");
    server.start();

    console.log("Initialized.");
})().then();