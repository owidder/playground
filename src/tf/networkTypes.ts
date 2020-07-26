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

export enum HoverType {
    BIAS, WEIGHT
  }  

export type NodeIterator = (ignoreInputs: boolean, accessor: (node: TfNode) => any) => void;
export type ChangeNumberOfNodesCallback = (layerIndex: number, diff: number) => void;

export type DataPoint = { [key: string]: number | string };

export type DataSource = {
    name: string;
    description?: string;
    source?: string;
    data: DataPoint[];
}
