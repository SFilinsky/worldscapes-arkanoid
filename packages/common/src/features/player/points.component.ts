import {ECRComponent} from "@worldscapes/common";

export class PointsComponent extends ECRComponent {
    constructor(
        readonly currentPoints: number
    ) {
        super();
    }
}