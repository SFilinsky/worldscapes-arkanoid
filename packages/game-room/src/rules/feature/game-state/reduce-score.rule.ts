import {
    ComponentPurposes,
    ComponentSelector, DeleteComponentCommand,
    ECRCommand,
    ECRRule,
    EntityRequest,
    isSet, OwnedComponent,
    ResourcePurposes,
    ResourceRequest, UpdateComponentCommand
} from "@worldscapes/common";
import {
    BallScoredEvent,
    GlobalEventEntityComponent,
    PointsComponent,
    RESOURCE_NAMES,
    SettingsResource
} from "@worldscapes-arkanoid/common";

export const reduceScoreRule = ECRRule.create({
    query: {
        entity: {
            players: new EntityRequest({
                points: new ComponentSelector(ComponentPurposes.WRITE, PointsComponent),
                owner: new ComponentSelector(ComponentPurposes.READ, OwnedComponent),
            }),
            events: new EntityRequest({
                globalEvents: new ComponentSelector(ComponentPurposes.HAS, GlobalEventEntityComponent),
                event: new ComponentSelector(ComponentPurposes.READ, BallScoredEvent)
            })
        },
        resource: {
            settings: new ResourceRequest<SettingsResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.settings)
        }
    },
    condition: ({ entity: { events }, resource: {settings}}) => isSet(settings) && events.length > 0,
    body: ({ entity: { players, events }, resource: { settings } }) => {

        const commands: ECRCommand[] = [];

        events.forEach(event => {

            const player = players.find(player => player.owner.ownerId === events[0].event.playerId);

            if (!player) {
                return;
            }

            commands.push(new UpdateComponentCommand(
                player.entityId,
                player.points,
                new PointsComponent(player.points.currentPoints - 1),
            ));

        });

        commands.push(
            ...events.map(event => new DeleteComponentCommand(event.entityId, event.event))
        );

        return commands;
    }
});