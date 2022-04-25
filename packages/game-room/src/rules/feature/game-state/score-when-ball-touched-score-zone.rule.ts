import {
    AddComponentCommand,
    ComponentPurposes,
    ComponentSelector,
    ECRCommand,
    ECRRule,
    EntityRequest,
    isSet,
    OwnedComponent,
    ResourcePurposes,
    ResourceRequest,
} from "@worldscapes/common";
import {
    BallComponent,
    BallScoredEvent,
    BodyComponent,
    GlobalEventEntityComponent, ResetGameEvent,
    RESOURCE_NAMES,
    ScoreZoneComponent,
    SettingsResource,
} from "@worldscapes-arkanoid/common";
import * as Matter from "matter-js";

export const scoreWhenBallTouchedScoreZoneRule = ECRRule.create({
    query: {
        entity: {
            balls: new EntityRequest({
                ball: new ComponentSelector(ComponentPurposes.HAS, BallComponent),
                body: new ComponentSelector(ComponentPurposes.WRITE, BodyComponent),
            }),
            zones: new EntityRequest({
                score: new ComponentSelector(ComponentPurposes.READ, ScoreZoneComponent),
                owner: new ComponentSelector(ComponentPurposes.READ, OwnedComponent),
                body: new ComponentSelector(ComponentPurposes.READ, BodyComponent),
            }),
            eventEntity: new EntityRequest({
                event: new ComponentSelector(ComponentPurposes.READ, GlobalEventEntityComponent)
            }),
        },
        resource: {
            settings: new ResourceRequest<SettingsResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.settings)
        }
    },
    condition: ({resource: {settings}}) => isSet(settings),
    body: ({entity: { balls, zones, eventEntity }, resource: { settings }}) => {

        const commands: ECRCommand[] = [];

        balls.forEach(ball => {
            const collisions = Matter.Query.collides(ball.body.instance, zones.map(zone => zone.body.instance));

            const collided = collisions.length > 0;
            if (!collided) {
                return;
            }

            const collidedZone = zones.find(zone =>
                collisions[0].bodyA === zone.body.instance ||
                collisions[0].bodyB === zone.body.instance
            );
            if (!collidedZone) {
                return;
            }

            commands.push(new AddComponentCommand(
                eventEntity[0].entityId,
                new BallScoredEvent(collidedZone.owner.ownerId),
            ));

            commands.push(new AddComponentCommand(
                eventEntity[0].entityId,
                new ResetGameEvent(),
            ));

        });

        return commands;
    }
});