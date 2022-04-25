import { ECRComponent } from "@worldscapes/common";

export class CollidedEvent extends ECRComponent {

    constructor(
        readonly uniqueStamp: number
    ) {
        super();
    }

}