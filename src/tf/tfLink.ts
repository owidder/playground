export class TfLink {

    sourceId: string;
    destId: string;
    weight: number;
    ctr:  number;

    constructor(sourceId: string, destId: string, weight: number, ctr?: number) {
        this.sourceId = sourceId;
        this.destId = destId;
        this.weight = weight;
        this.ctr = ctr;
    }
}
