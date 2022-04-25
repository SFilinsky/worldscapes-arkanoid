import {
   AddComponentCommand,
   ComponentPurposes,
   ComponentSelector,
   ECRCommand,
   ECRRule,
   EntityRequest,
   isSet,
   PlayerActionTools,
   ResourcePurposes,
   ResourceRequest,
   UpdateResourceCommand
} from "@worldscapes/common";
import {GameStartEvent, GameStateResource, GlobalEventEntityComponent, RESOURCE_NAMES, StartGameAction} from "@worldscapes-arkanoid/common";

export const startGameHandler = ECRRule.create({
   query: {
      entity: {
         actions: PlayerActionTools.CreateRequest(StartGameAction),
         eventEntity: new EntityRequest({ event: new ComponentSelector(ComponentPurposes.READ, GlobalEventEntityComponent) })
      },
      resource: {
         gameState: new ResourceRequest<GameStateResource, typeof ResourcePurposes.WRITE>(ResourcePurposes.WRITE, RESOURCE_NAMES.gameState),
      }
   },
   condition: ({ entity: { actions }, resource: { gameState } }) => actions.length > 0 && isSet(gameState) && gameState.isStarted === false,
   body: ({ entity: { actions, eventEntity }, resource: { gameState }}) => {
      const commands: ECRCommand[] = [];

      const playersStarted = actions.reduce(
          (acc, action) => {
             return { ...acc, [action.owner.ownerId]: true };
          },
          gameState!.playersStarted
      );

      let isStarted = gameState!.isStarted;
      if (!Object.values(playersStarted).includes(false)) {
         isStarted = true;
      }

      commands.push(
          new UpdateResourceCommand(
             RESOURCE_NAMES.gameState,
             new GameStateResource(isStarted, playersStarted),
         )
      );

      if (!gameState!.isStarted && isStarted) {
         commands.push(new AddComponentCommand(
            eventEntity[0].entityId,
            new GameStartEvent()
         ));
      }

      return commands;
   },
});