import {TfLink} from "./tfLink";

export class TfNode {
    id: string;
    inputLinks?: TfLink[];
    bias?: number;

    constructor(id: string, inputLinks?: TfLink[], bias?: number) {
        this.id = id;
        this.inputLinks = inputLinks;
        this.bias = bias;
    }
}

