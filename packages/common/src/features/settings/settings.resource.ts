import {ECRResource} from "@worldscapes/common";
import {GameRoomSettings, GameSettings} from "../../settings";

export class SettingsResource extends ECRResource {
    constructor(
        readonly gameSettings: GameSettings,
        readonly gameRoomSettings: GameRoomSettings,
    ) {
        super();
    }
}