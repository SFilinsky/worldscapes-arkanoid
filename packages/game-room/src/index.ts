import {SimpleEcr } from "@worldscapes/common";
import {SimpleEngineServer, SimpleNetworkServer, SimpleServerSimulation, WebsocketServerNetworkAdapter } from "@worldscapes/server";
import {readPlayers} from "./system/readPlayers";

const players = readPlayers();

async function init() {
    console.log("Initializing Engine.");

    console.log("Setting up network server.");
    const serverAdapter = new WebsocketServerNetworkAdapter(50001);
    await serverAdapter.isReady();
    console.log("Network server is up.");

    console.log("Creating simulation instance");
    const ecr = new SimpleEcr();

    console.log("Creating Engine Server.");
    const server = new SimpleEngineServer(
        new SimpleServerSimulation(ecr),
        new SimpleNetworkServer(serverAdapter),
    );


    console.log("Starting Engine Server.");
    server.start();

    console.log("Initialized.");
}

init().then();