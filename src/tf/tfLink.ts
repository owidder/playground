export class TfLink {

    sourceId: string;
    destId: string;
     weight: number;

    constructor(sourceId: string, destId: string, weight: number) {
        this.sourceId = sourceId;
        this.destId = destId;
        this.weight = weight;
    }
}
