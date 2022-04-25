import {AddResourceCommand, CreateEntityCommand, ECRCommand, OwnedComponent} from "@worldscapes/common";
import {
    PlatformComponent,
    PointsComponent,
    PREDEFINED_IDS,
    GameRoomSettings,
    GameSettings,
    SettingsResource,
    RESOURCE_NAMES,
    GameStateResource,
    BallComponent,
    BodyComponent,
    GlobalEventEntityComponent,
    TimeResource,
    WallComponent, ScoreZoneComponent
} from "@worldscapes-arkanoid/common";
import {Bodies} from "matter-js";
import {createClearBallBody} from "../../rules/feature/game-state/reset-game.rule";
import {hrtimeMs} from "../../rules/feature/time/update-time.rule";

/**
 * Creates rect with (X; Y) in left corner
 * @param params
 */
export const createRectBody = (...params: Parameters<typeof Bodies.rectangle>): ReturnType<typeof Bodies.rectangle> => {
    params[0] += params[2] / 2;
    params[1] += params[3] / 2;
    return Bodies.rectangle(...params);
};

export const commandInitializer = (
    gameRoomSettings: GameRoomSettings,
    gameSettings: GameSettings,
): ECRCommand[] => {
    return [

        new AddResourceCommand(
            RESOURCE_NAMES.time,
            new TimeResource(hrtimeMs(), 0, 0),
        ),

        new AddResourceCommand(
            RESOURCE_NAMES.settings, new SettingsResource(gameSettings, gameRoomSettings)
        ),

        new AddResourceCommand(
            RESOURCE_NAMES.gameState, new GameStateResource(
                false,
                {
                    [gameRoomSettings.player1.id]: false,
                    [gameRoomSettings.player2.id]: false,
                },
            ),
        ),

        new CreateEntityCommand(
            [ new OwnedComponent(gameRoomSettings.player1.id), new PointsComponent(5) ],
            { predefinedId: PREDEFINED_IDS.player1 }
        ),

        new CreateEntityCommand(
            [ new OwnedComponent(gameRoomSettings.player2.id), new PointsComponent(5) ],
            { predefinedId: PREDEFINED_IDS.player2 }
        ),

        new CreateEntityCommand(
            [
                new OwnedComponent(gameRoomSettings.player1.id),
                new PlatformComponent(),
                new BodyComponent(createRectBody(
                    0,
                    gameSettings.platformGapFromBorder,
                    gameSettings.platformWidth,
                    gameSettings.platformHeight,
                    {
                        isStatic: true,
                        friction: gameSettings.platformFriction,
                        restitution: gameSettings.platformRestitution,
                        // chamfer: { radius: 4 },
                    }
                ))
            ],
            { predefinedId: PREDEFINED_IDS.platform1 }
        ),

        new CreateEntityCommand(
            [
                new OwnedComponent(gameRoomSettings.player2.id),
                new PlatformComponent(),
                new BodyComponent(createRectBody(
                    0,
                    gameSettings.gameRoomHeight - gameSettings.platformHeight - gameSettings.platformGapFromBorder,
                    gameSettings.platformWidth,
                    gameSettings.platformHeight,
                    {
                        isStatic: true,
                        friction: gameSettings.platformFriction,
                        restitution: gameSettings.platformRestitution,
                        // chamfer: { radius: 4 },
                    }
                ))
            ],
            { predefinedId: PREDEFINED_IDS.platform2 },
        ),

        new CreateEntityCommand(
            [
                new BallComponent(),
                new BodyComponent(createClearBallBody(gameSettings))

            ],
            { predefinedId: PREDEFINED_IDS.ball },
        ),

        new CreateEntityCommand(
            [
                new GlobalEventEntityComponent(),
            ],
            { predefinedId: PREDEFINED_IDS.globalEventEntity },
        ),

        new CreateEntityCommand(
            [
                new WallComponent(),
                new BodyComponent(createRectBody(
                    -100,
                    0,
                    100,
                    gameSettings.gameRoomHeight,
                    {
                        isStatic: true
                    }
                ))
            ],
            { predefinedId: PREDEFINED_IDS.wallLeft },
        ),

        new CreateEntityCommand(
            [
                new WallComponent(),
                new BodyComponent(createRectBody(
                    gameSettings.gameRoomWidth,
                    0,
                    100,
                    gameSettings.gameRoomHeight,
                    {
                        isStatic: true
                    }
                ))
            ],
            { predefinedId: PREDEFINED_IDS.wallRight },
        ),

        new CreateEntityCommand(
            [
                new ScoreZoneComponent(),
                new BodyComponent(createRectBody(
                    0,
                    -100 - 20,
                    gameSettings.gameRoomWidth,
                    100,
                    { isSensor: true }
                )),
                new OwnedComponent(gameRoomSettings.player1.id)
            ],
            { predefinedId: PREDEFINED_IDS.scoreZoneTop },
        ),

        new CreateEntityCommand(
            [
                new ScoreZoneComponent(),
                new BodyComponent(createRectBody(
                    0,
                    gameSettings.gameRoomHeight + 20,
                    gameSettings.gameRoomWidth,
                    100,
                    { isSensor: true }
                )),
                new OwnedComponent(gameRoomSettings.player2.id)
            ],
            { predefinedId: PREDEFINED_IDS.scoreZoneBottom },
        )
    ];
};
