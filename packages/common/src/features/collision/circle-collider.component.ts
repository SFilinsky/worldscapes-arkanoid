import { Collidable } from "./collidable.component";

export class CircleColliderComponent extends Collidable {
    constructor(
        readonly radius: number
    ) {
        super();
    }
}