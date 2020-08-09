/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

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
export type AddNewLayerCallback = (insertAfterLayerWithIndex: number) => void;
export type RemoveLayerCallback = (layerIndex: number) => void;
export type ChangeActivationCallback = (activation: string, layerIndex: number) => void;

export type DataPoint = { [key: string]: number | string };

export type DataSource = {
    name: string;
    description: string;
    originalSourceUrl: string;
    data: DataPoint[];
}

export const activationFunctionNames = {
    elu: "eLU",
    linear: "Linear",
    relu: "ReLU",
    relu6: "ReLU6",
    selu: "SeLU",
    sigmoid: "Sigmoid",
    tanh: "Tanh",
    hardSigmoid: "Hard Sigmoid",
    softmax: "Softmax",
    softplus: "Softplus",
    softsign: "Softsign"
}
