import {ECRResource} from "@worldscapes/common";

export class TimeResource extends ECRResource {
    constructor(
        readonly currentTime: number,
        readonly currentDelta: number,
        readonly previousDelta: number
    ) {
        super();
    }
}