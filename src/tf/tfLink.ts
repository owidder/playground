export class TfLink {

    private sourceId: string;
    private destId: string;
    private weight: number;

    public getSourceId = () => this.sourceId;
    public getDestId = () => this.destId;
    public getWeight = () => this.weight;

    constructor(sourceId: string, destId: string, weight: number) {
        this.sourceId = sourceId;
        this.destId = destId;
        this.weight = weight;
    }
}
