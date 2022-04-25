import {ECRComponent} from "@worldscapes/common";

export class BallScoredEvent extends ECRComponent {
    constructor(
        readonly playerId: string,
    ) {
        super();
    }
}