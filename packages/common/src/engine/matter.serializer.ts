import { NetworkSerializerApi } from "@worldscapes/common";

/**
 * This class is needed to allow Matter.Body serialization
 */
export class MatterSerializer extends NetworkSerializerApi {

    stringify<T>(data: T): string {
        return JSON.stringify(
            data,
            (key, value) => (key === 'parent' || key === 'parts' || key === 'body') ? undefined : value
        );
    }

    parse<T>(data: string): T {
        return JSON.parse(data, (key, value) => {
            return value;
        });
    }

}