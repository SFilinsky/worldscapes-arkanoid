import {ECRComponent} from "@worldscapes/common";

export class SpatialComponent extends ECRComponent {
    constructor(
        readonly x: number,
        readonly y: number
    ) {
        super();
    }
}