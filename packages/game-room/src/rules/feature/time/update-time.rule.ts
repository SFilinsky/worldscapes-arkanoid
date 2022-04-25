import {ECRRule, isSet, ResourcePurposes, ResourceRequest, UpdateResourceCommand} from "@worldscapes/common";
import {RESOURCE_NAMES, TimeResource} from "@worldscapes-arkanoid/common";
import * as process from "process";

export const hrtimeMs = (): number => {
    const time = process.hrtime();
    return time[0] * 1000 + time[1] / 1000000;
};

export const updateTimeRule = ECRRule.create({
    query: {
        entity: {},
        resource: {
            time: new ResourceRequest<TimeResource, typeof ResourcePurposes.WRITE>(ResourcePurposes.WRITE, RESOURCE_NAMES.time)
        }
    },
    condition: ({ resource: { time }}) => isSet(time),
    body: ({ resource: { time }}) => {

        const timestamp = hrtimeMs();
        const delta = (timestamp - time!.currentTime) / 1000;

        return [
            new UpdateResourceCommand(
                RESOURCE_NAMES.time,
                new TimeResource(timestamp, delta, time!.currentDelta)
            ),
        ];
    },
});