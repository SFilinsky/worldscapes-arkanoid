import {PlayerInfo, SimpleEcr} from "@worldscapes/common";
import {
    SimpleEngineServer,
    SimpleNetworkServer,
    SimpleServerAuth,
    SimpleServerSimulation,
    WebsocketServerNetworkAdapter
} from "@worldscapes/server";
import {commandInitializer} from "./setup/initializers/command.initializer";
import {ruleInitializer} from "./setup/initializers/rule.initializer";
import {GameSettings} from "@worldscapes-arkanoid/common";
import {params} from "./setup/cli/params";

const gameRoomSettings = params();

const players: PlayerInfo[] = [
    gameRoomSettings.player1,
    gameRoomSettings.player2
];

const DEFAULT_GAME_SETTINGS: GameSettings = {
    initialPoints: 5,
    gameRoomWidth: 750,
    gameRoomHeight: 500,
    platformWidth: 60,
    platformHeight: 10,
    platformGapFromBorder: 10,
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
    rules.forEach(rule => ecr.addRule(rule));

    console.log("Creating Engine Server.");
    const server = new SimpleEngineServer(
        new SimpleServerSimulation(ecr, players),
        new SimpleNetworkServer(serverAdapter),
    );

    console.log("Starting Engine Server.");
    server.start();

    console.log("Initialized.");
})().then();