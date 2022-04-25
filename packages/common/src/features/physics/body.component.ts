import {ECRComponent} from "@worldscapes/common";
import { Body } from "matter-js";

export class BodyComponent extends ECRComponent {
    constructor(
        readonly instance: Body
    ) {
        super();
    }
}