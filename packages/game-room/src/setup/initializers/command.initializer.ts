import {AddResourceCommand, CreateEntityCommand, OwnedComponent} from "@worldscapes/common";
import {
    PlatformComponent,
    PointsComponent,
    PREDEFINED_IDS,
    RectColliderComponent,
    SpatialComponent,
    GameRoomSettings,
    GameSettings,
    SettingsResource
} from "@worldscapes-arkanoid/common";

export const commandInitializer = (
    gameRoomSettings: GameRoomSettings,
    gameSettings: GameSettings,
) => {
    return [
        new AddResourceCommand(
            "settings", new SettingsResource(gameSettings, gameRoomSettings)
        ),
        new CreateEntityCommand(
            [ new OwnedComponent(gameRoomSettings.player1.id), new PointsComponent(5) ],
            { predefinedId: PREDEFINED_IDS.player1 }
        ),
        new CreateEntityCommand(
            [ new OwnedComponent(gameRoomSettings.player1.id), new PointsComponent(5) ],
            { predefinedId: PREDEFINED_IDS.player2 }
        ),
        new CreateEntityCommand(
            [
                new OwnedComponent(gameRoomSettings.player1.id),
                new PlatformComponent(),
                new SpatialComponent(0, gameSettings.platformGapFromBorder),
                new RectColliderComponent(gameSettings.platformWidth, gameSettings.platformHeight)
            ],
            { predefinedId: PREDEFINED_IDS.platform1 }
        ),
        new CreateEntityCommand(
            [
                new OwnedComponent(gameRoomSettings.player2.id),
                new PlatformComponent(),
                new SpatialComponent(0, gameSettings.gameRoomHeight - gameSettings.platformHeight - gameSettings.platformGapFromBorder),
                new RectColliderComponent(gameSettings.platformWidth, gameSettings.platformHeight)
            ],
            { predefinedId: PREDEFINED_IDS.platform2 },
        ),
    ];
};