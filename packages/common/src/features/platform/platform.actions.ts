import { PlayerAction } from "@worldscapes/common";

export class MovePlatformAction extends PlayerAction {
    constructor(
        readonly targetPositionX: number
    ) {
        super();
    }
}