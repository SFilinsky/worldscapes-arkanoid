import {
    ComponentPurposes,
    ComponentSelector, DeleteComponentCommand,
    ECRCommand,
    ECRRule,
    EntityRequest,
    isSet,
    ResourcePurposes,
    ResourceRequest, UpdateComponentCommand, UpdateResourceCommand
} from "@worldscapes/common";
import {
    BallComponent,
    BodyComponent, GameSettings,
    GameStateResource,
    GlobalEventEntityComponent,
    ResetGameEvent,
    RESOURCE_NAMES,
    SettingsResource,
} from "@worldscapes-arkanoid/common";
import * as Matter from "matter-js";



export function createClearBallBody(gameSettings: GameSettings): Matter.Body {
    const body = Matter.Bodies.circle(
        gameSettings.gameRoomWidth / 2,
        gameSettings.gameRoomHeight / 2,
        gameSettings.ballRadius,
        {
            density: gameSettings.ballDensity,
            frictionAir: 0.001,
            friction: 0.001,
            frictionStatic: 0.001,
            restitution: gameSettings.ballRestitution,
        }
    );

    return body;
}


export const resetGameRule = ECRRule.create({
    query: {
        entity: {
            balls: new EntityRequest({
                ball: new ComponentSelector(ComponentPurposes.HAS, BallComponent),
                body: new ComponentSelector(ComponentPurposes.WRITE, BodyComponent),
            }),
            events: new EntityRequest({
                globalEvents: new ComponentSelector(ComponentPurposes.HAS, GlobalEventEntityComponent),
                event: new ComponentSelector(ComponentPurposes.READ, ResetGameEvent)
            })
        },
        resource: {
            gameState: new ResourceRequest<GameStateResource, typeof ResourcePurposes.WRITE>(ResourcePurposes.WRITE, RESOURCE_NAMES.gameState),
            settings: new ResourceRequest<SettingsResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.settings)
        }
    },
    condition: ({ entity: { events }, resource: { gameState, settings}}) => isSet(gameState) && isSet(settings) && events.length > 0,
    body: ({ entity: { balls, events }, resource: { gameState, settings } }) => {

        const commands: ECRCommand[] = [];

        const gameSettings = settings!.gameSettings;

        balls.forEach(ball => {

            commands.push(
                new UpdateComponentCommand(
                    ball.entityId,
                    ball.body,
                    new BodyComponent(createClearBallBody(gameSettings))
                )
            );

        });

        commands.push(new UpdateResourceCommand(
            RESOURCE_NAMES.gameState,
            new GameStateResource(
                false,
                Object.keys(gameState!.playersStarted).reduce(
                    (acc, key) => ({ ...acc, [key]: false}),
                    {},
                )
            )
        ));

        commands.push(
            ...events.map(event => new DeleteComponentCommand(event.entityId, event.event))
        );

        return commands;
    }
});