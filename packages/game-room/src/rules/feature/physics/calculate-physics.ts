import {
    BodyComponent,
    CollidedEvent,
    GameStateResource,
    RESOURCE_NAMES,
    SettingsResource,
    TimeResource
} from "@worldscapes-arkanoid/common";
import {
    AddComponentCommand,
    ComponentPurposes,
    ComponentSelector,
    DeleteComponentCommand,
    ECRCommand,
    ECRRule,
    EntityRequest,
    isSet,
    ResourcePurposes,
    ResourceRequest,
    UpdateComponentCommand
} from "@worldscapes/common";
import * as Matter from "matter-js";
import {Engine, IEventCollision} from "matter-js";


const engine = Matter.Engine.create();
engine.gravity.y = 0;
engine.constraintIterations = 6;
engine.positionIterations = 30;
engine.velocityIterations = 30;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Matter.Resolver._restingThresh = 0.5;


export const calculatePhysics = ECRRule.create({
    query: {
        entity: {
            bodies: new EntityRequest({
                body: new ComponentSelector(ComponentPurposes.WRITE, BodyComponent),
            }),
            events: new EntityRequest({
                body: new ComponentSelector(ComponentPurposes.WRITE, BodyComponent),
                event: new ComponentSelector(ComponentPurposes.WRITE, CollidedEvent)
            }),
        },
        resource: {
            gameState: new ResourceRequest<GameStateResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.gameState),
            settings: new ResourceRequest<SettingsResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.settings),
            time: new ResourceRequest<TimeResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.time),
        },
    },
    condition: ({ resource: { gameState, settings, time } }) => isSet(gameState) && gameState.isStarted && isSet(settings) && isSet(time),
    body: ({ entity: { bodies, events }, resource: { settings, time } }) => {

        const commands: ECRCommand[] = [];

        // Clear previous events
        events.forEach(event => {
           commands.push(new DeleteComponentCommand(event.entityId, event.event));
        });

        // Copy Bodies to keep them not mutated
        const copiedBodies = new Map<number, Matter.Body>();

        bodies.forEach(bodyEntity => {
            const copy = Matter.Body.create({
                ...bodyEntity.body.instance,
                parent: undefined,
                parts: [],
            });
            copy['__entityId'] = bodyEntity.entityId;

            copiedBodies.set(bodyEntity.entityId, copy);
        });

        // Run simulation tick
        Matter.Composite.add(engine.world, Array.from(copiedBodies.values()));

        // Listen collision events
        function handleCollisions(events: IEventCollision<Engine>) {

            const collidedBodies: Matter.Body[] = [];

            events.pairs.forEach(pair => {
                collidedBodies.push(pair.bodyA);
                collidedBodies.push(pair.bodyB);
            });

            const uniqueCollidedBodies = Array.from(new Set(collidedBodies));

            uniqueCollidedBodies.forEach(body => {

                    commands.push(
                        new AddComponentCommand(
                            body['__entityId'],
                            new CollidedEvent(Date.now())
                        )
                    );
                });
        }

        Matter.Events.on(engine, 'collisionEnd', handleCollisions);

        // Run update
        Matter.Engine.update(engine, time!.currentDelta * 1000, time!.currentDelta / time!.previousDelta);

        // Clean collision listener
        Matter.Events.off(engine, 'collisionEnd', handleCollisions);

        // Clear engine
        Matter.Composite.clear(engine.world, false);

        // Update body components
        const copiedTuples = Array.from(copiedBodies.entries());
        bodies.forEach(bodyEntity => {
            commands.push(
                new UpdateComponentCommand(
                    bodyEntity.entityId,
                    bodyEntity.body,
                    new BodyComponent(copiedBodies.get(bodyEntity.entityId)!),
                )
            );
        });

        return commands;
    },
});