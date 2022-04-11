import {ECRResource} from "@worldscapes/common";

export class TimeResource extends ECRResource {
    constructor(
        readonly currentTime: string,
        readonly currentDelta: string,
    ) {
        super();
    }
}