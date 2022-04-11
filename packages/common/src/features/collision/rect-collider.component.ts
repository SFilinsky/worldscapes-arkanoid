import { Collidable } from "./collidable.component";

export class RectColliderComponent extends Collidable {
    constructor(
        readonly width: number,
        readonly height: number
    ) {
        super();
    }
}