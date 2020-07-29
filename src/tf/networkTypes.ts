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

export class TfNode {
    id: string;
    name?: string;
    inputLinks?: TfLink[];
    bias?: number;

    constructor(id: string, inputLinks?: TfLink[], bias?: number, name?: string) {
        this.id = id;
        this.inputLinks = inputLinks ? inputLinks : [];
        this.bias = bias;
        this.name = name;
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
