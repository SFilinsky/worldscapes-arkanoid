import {
  ComponentPurposes,
  ComponentSelector,
  ECRRule,
  EntityRequest,
  ResourcePurposes,
  ResourceRequest,
  UpdateComponentCommand,
  PlayerActionTools,
  isSet,
  OwnedComponent
} from "@worldscapes/common";
import {
  BodyComponent, clamp,
  MovePlatformAction,
  PlatformComponent,
  RESOURCE_NAMES, SettingsResource,
} from "@worldscapes-arkanoid/common";
import {Body, Vector} from "matter-js";

export const movePlatformHandler = ECRRule.create({
  query: {
    entity: {
      actions: PlayerActionTools.CreateRequest(MovePlatformAction),
      platforms: new EntityRequest({
        owner: new ComponentSelector(ComponentPurposes.READ, OwnedComponent),
        platform: new ComponentSelector(ComponentPurposes.READ, PlatformComponent),
        body: new ComponentSelector(ComponentPurposes.WRITE, BodyComponent),
      })
    },
    resource: {
      settings: new ResourceRequest<SettingsResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.settings),
    }
  },
  condition: ({ entity: { actions, platforms }, resource: { settings } }) => actions.length > 0 && isSet(settings),
  body: ({ entity: { actions, platforms }, resource: { settings } }) => {
    return actions.map(action => {

      const platform = platforms.find(platform => platform.owner.ownerId === action.owner.ownerId);
      if (!platform) {
        return null;
      }

      const positionX = clamp(
        action.action.targetPositionX - settings!.gameSettings.platformWidth / 2,
        0,
        settings!.gameSettings.gameRoomWidth - settings!.gameSettings.platformWidth
      );

      const copy = Body.create({
        ...platform.body.instance,
        parent: undefined,
        parts: [],
      });

      Body.setPosition(copy, Vector.create(
        positionX + settings!.gameSettings.platformWidth / 2,
        platform.body.instance.position.y
      ));

      return new UpdateComponentCommand(
          platform.entityId,
          platform.body,
          new BodyComponent(copy)
      );

    })
    .filter(isSet);
  }
});