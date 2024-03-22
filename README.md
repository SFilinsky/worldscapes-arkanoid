# worldscapes-arkanoid

This is test / example game for [Worldscapes Engine](https://github.com/worldscapes/engine).

It uses Angular as client-side framework, Pixi.js for rendering and Matter.js for server-side physics.

To start, you can check game [simulation rules](./packages/game-room/src/rules/feature). They define most of the core logic on server.

To see how Worldscapes Server is bootstrapped, take a look at [Game Room index.js](packages/game-room/src/index.ts). The assumption is that there could be a matchmaking server that starts several separate rooms (but it's out of the scope of this implementation).

To see how Worldscapes Client is wrapped to allow input and rendering, you can see [Worldscapes Service](packages/frontend/src/app/services/worldscapes.service.ts). It allows queries to be accessed as Observable in Angular context, making it essentially a stream of game simulation updates, as well as convering input throughout client frontend into Worldscapes input events.

Initial game state is defined by [Initializers](packages/game-room/src/setup/initializers).

Matter.js is wrapped in [Calculate Physics simulation rule](ackages/game-room/src/rules/feature/physics/calculate-physics.ts). To store physics state in Game State storage of engine, [Matter Serializer](packages/common/src/engine/matter.serializer.ts) is used. 
