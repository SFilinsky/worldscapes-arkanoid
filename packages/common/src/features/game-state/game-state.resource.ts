import {ECRResource, PlayerId} from "@worldscapes/common";

export class GameStateResource extends ECRResource {
    constructor(
        readonly isStarted: boolean,
        readonly playersStarted: Record<PlayerId, boolean>,
    ) {
        super();
    }
}