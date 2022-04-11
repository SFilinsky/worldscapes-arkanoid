import {SpatialComponent} from "../general/spatial.component";
import {isTypeOf} from "@worldscapes/common";
import {CircleColliderComponent} from "./circle-collider.component";
import {RectColliderComponent} from "./rect-collider.component";
import {Collidable} from "./collidable.component";


export const collisionCheckTool = (
    spatial1: SpatialComponent,
    collider1: Collidable,
    spatial2: SpatialComponent,
    collider2: Collidable
) => {
    const isCircle = (obj: Collidable): obj is CircleColliderComponent => isTypeOf(obj, CircleColliderComponent);
    const isRect = (obj: Collidable): obj is RectColliderComponent => isTypeOf(obj, RectColliderComponent);

    if (isCircle(collider1)) {
        if (isCircle(collider2)) {
            return collisionCheckCircles(spatial1, collider1, spatial2, collider2);
        }
        if (isRect(collider2)) {
            return collisionCheckCircleRect(spatial1, collider1, spatial2, collider2);
        }
    } else if (isRect(collider1)) {
        if (isCircle(collider2)) {
            return collisionCheckCircleRect(spatial2, collider2, spatial1, collider1);
        }
        if (isRect(collider2)) {
            return collisionCheckRects(spatial1, collider1, spatial2, collider2);
        }
    } else {
        return false;
    }
};

const collisionCheckCircles = (
    spatial1: SpatialComponent,
    collider1: CircleColliderComponent,
    spatial2: SpatialComponent,
    collider2: CircleColliderComponent
) => {
    return (spatial1.x - spatial2.x) ** 2 + (spatial1.y - spatial2.y) ** 2 <= (collider1.radius + collider1.radius) ** 2;
};

const collisionCheckRects = (
    spatial1: SpatialComponent,
    collider1: RectColliderComponent,
    spatial2: SpatialComponent,
    collider2: RectColliderComponent
) => {
    return false;
};

const collisionCheckCircleRect = (
    spatial1: SpatialComponent,
    collider1: CircleColliderComponent,
    spatial2: SpatialComponent,
    collider2: RectColliderComponent
) => {
    // const closeness = ((spatial1.x - spatial2.x) ** 2 + (spatial1.y - spatial2.y) ** 2) / collider1.radius ** 2;
    // return closeness <= 1;
    return false;
};


