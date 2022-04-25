import { GameRoomSettings, GameSettings } from "@worldscapes-arkanoid/common";

import {startGameHandler} from "../../rules/feature/player-input/start-game.handler";
import {movePlatformHandler} from "../../rules/feature/player-input/move-platform.handler";
import {moveBallOnGameStartRule} from "../../rules/feature/ball/move-ball-on-game-start.rule";
import {updateTimeRule} from "../../rules/feature/time/update-time.rule";
import {
    scoreWhenBallTouchedScoreZoneRule
} from "../../rules/feature/game-state/score-when-ball-touched-score-zone.rule";
import {reduceScoreRule} from "../../rules/feature/game-state/reduce-score.rule";
import {resetGameRule} from "../../rules/feature/game-state/reset-game.rule";
import {calculatePhysics} from "../../rules/feature/physics/calculate-physics";

export const ruleInitializer = (
    gameRoomSettings: GameRoomSettings,
    gameSettings: GameSettings,
) => {
    return [
        updateTimeRule,
        startGameHandler,
        moveBallOnGameStartRule,
        movePlatformHandler,
        calculatePhysics,
        scoreWhenBallTouchedScoreZoneRule,
        reduceScoreRule,
        resetGameRule,
    ];
};