import {TfLink} from "./tfLink";
import { thresholdScott } from "d3";

export class TfNode {
    id: string;
    inputLinks?: TfLink[];
    bias?: number;
    ctr: number;

    constructor(id: string, inputLinks?: TfLink[], bias?: number, ctr?: number) {
        this.id = id;
        this.inputLinks = inputLinks ? inputLinks : [];
        this.bias = bias;
        this.ctr = ctr;
    }
}

