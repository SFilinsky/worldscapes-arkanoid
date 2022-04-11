import {ECRComponent} from "@worldscapes/common";

export class MovementTargetComponent extends ECRComponent {
    constructor(
        readonly x: number,
        readonly y: number
    ) {
        super();
    }
}