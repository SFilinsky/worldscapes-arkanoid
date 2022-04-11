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
  MovePlatformAction,
  PlatformComponent,
  RectColliderComponent, RESOURCE_NAMES, SettingsResource,
  SpatialComponent
} from "@worldscapes-arkanoid/common";

export const movePlatformRule = ECRRule.create({
  query: {
    entity: {
      actions: PlayerActionTools.CreateRequest(MovePlatformAction),
      platforms: new EntityRequest({
        owner: new ComponentSelector(ComponentPurposes.READ, OwnedComponent),
        platform: new ComponentSelector(ComponentPurposes.READ, PlatformComponent),
        spatial: new ComponentSelector(ComponentPurposes.READ, SpatialComponent),
        rect: new ComponentSelector(ComponentPurposes.READ, RectColliderComponent),
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

      const positionX = Math.max(Math.min(action.action.targetPositionX, settings!.gameSettings.gameRoomWidth - platform.rect.width), 0);

      return new UpdateComponentCommand(platform.entityId, platform.spatial, new SpatialComponent(positionX, platform.spatial.y));
    })
    .filter(isSet);
  }
});