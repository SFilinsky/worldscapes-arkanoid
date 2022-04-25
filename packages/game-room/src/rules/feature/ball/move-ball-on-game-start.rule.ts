import {
    ComponentPurposes,
    ComponentSelector,
    DeleteComponentCommand,
    ECRRule,
    EntityRequest,
    isSet,
    ResourceRequest,
    UpdateComponentCommand
} from "@worldscapes/common";
import {
    BallComponent,
    BodyComponent,
    GameStartEvent,
    RESOURCE_NAMES,
    SettingsResource
} from "@worldscapes-arkanoid/common";
import {Body} from "matter-js";
import * as Matter from "matter-js";

export const moveBallOnGameStartRule = ECRRule.create({
    query: {
        entity: {
            balls: new EntityRequest({
                ball: new ComponentSelector(ComponentPurposes.HAS, BallComponent),
                body: new ComponentSelector(ComponentPurposes.WRITE, BodyComponent),
            }),
            gameStart: new EntityRequest({
                event: new ComponentSelector(ComponentPurposes.READ, GameStartEvent),
            }),
        },
        resource: {
            settings: new ResourceRequest<SettingsResource, typeof ComponentPurposes.READ>(ComponentPurposes.READ, RESOURCE_NAMES.settings)
        },
    },
    condition: ({ entity: { gameStart }, resource: { settings } }) => isSet(settings) && gameStart.length > 0,
    body: ({ entity: { gameStart, balls }, resource: { settings } }) => {
        return [
            ...balls.map(ball => {

                const copy = Body.create({
                    ...ball.body.instance,
                    parent: undefined,
                    parts: [],
                });

                const forceDirection = Matter.Vector.mult(
                    Matter.Vector.normalise(
                        Matter.Vector.create(
                            Math.random(),
                            Math.random() + 0.5,
                        )
                    ),
                    settings!.gameSettings.ballInitialForce,
                );

                Matter.Body.applyForce(
                    copy,
                    {
                        x: copy.position.x,
                        y: copy.position.y,
                    },
                    forceDirection
                );

                return new UpdateComponentCommand(
                    ball.entityId,
                    ball.body,
                    new BodyComponent(copy)
                );
            }),
            ...gameStart.map(entity => new DeleteComponentCommand(entity.entityId, entity.event))
        ];
    },
});