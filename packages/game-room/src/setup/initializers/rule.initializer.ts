import { GameRoomSettings, GameSettings } from "@worldscapes-arkanoid/common";
import {movePlatformRule} from "../../rules/feature/player-input/move-platform.rule";

export const ruleInitializer = (
    gameRoomSettings: GameRoomSettings,
    gameSettings: GameSettings,
) => {
    return [
        movePlatformRule
    ];
};