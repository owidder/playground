import {TfLink} from "./tfLink";

export class TfNode {
    private id: string;
    private inputLinks?: TfLink[];

    public getId = () => this.id;
    public getInputLinks = () => this.inputLinks;

    constructor(id: string, inputLinks?: TfLink[]) {
        this.id = id;
        this.inputLinks = inputLinks;
    }
}

